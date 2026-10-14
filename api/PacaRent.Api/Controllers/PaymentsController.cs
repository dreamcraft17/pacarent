using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using PacaRent.Api.Extensions;
using PacaRent.Api.Models;
using PacaRent.Core.Entities;
using PacaRent.Core.Enums;
using PacaRent.Core.Options;
using PacaRent.Core.Rules;
using PacaRent.Infra.Data;
using PacaRent.Infra.Services;

namespace PacaRent.Api.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController(
    PacaRentDbContext db,
    IPaymentGatewayService gateway,
    INotificationService notify,
    IAuditService audit,
    IOptions<PacaRentSettings> settings,
    IOptions<DokuSettings> dokuOptions) : ControllerBase
{
    [HttpPost("checkout/{bookingId:guid}")]
    [Authorize]
    public async Task<IActionResult> Checkout(Guid bookingId, CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        var booking = await db.Bookings
            .Include(b => b.User)
            .ThenInclude(u => u.Profile)
            .FirstOrDefaultAsync(b => b.Id == bookingId, ct);
        if (booking is null) return NotFound();
        if (booking.UserId != userId) return Forbid();
        if (settings.Value.SkipBookingPayment)
        {
            return BadRequest(new ApiError("payments_disabled", "Pembayaran belum aktif (early release)."));
        }

        if (booking.Status != BookingStatus.Accepted)
        {
            return BadRequest(new ApiError("not_accepted", "Booking harus diterima mitra sebelum bayar."));
        }

        var fee = BusinessRules.CalculatePlatformFee(booking.TotalAmount, settings.Value.PlatformFeePercent);
        var doku = dokuOptions.Value;
        var callback = doku.WebCallbackUrl.TrimEnd('/');
        var sep = callback.Contains('?', StringComparison.Ordinal) ? '&' : '?';
        callback += $"{sep}from=doku&bookingId={bookingId:D}";

        var customerName = booking.User.Profile?.FullName ?? booking.User.Email ?? "PacaRent User";
        var customer = new DokuCustomer(
            booking.User.Id,
            customerName,
            booking.User.Email ?? "",
            booking.User.Phone);

        var checkout = await gateway.CreateCheckoutAsync(
            booking.Id,
            booking.TotalAmount,
            customer,
            callback,
            ct);

        var payment = await db.Payments.FirstOrDefaultAsync(p => p.BookingId == bookingId, ct);
        if (payment is null)
        {
            payment = new Payment
            {
                Id = Guid.NewGuid(),
                BookingId = bookingId,
                Amount = booking.TotalAmount,
                PlatformFee = fee,
                GatewayRef = checkout.GatewayRef,
                Status = PaymentStatus.Pending
            };
            db.Payments.Add(payment);
        }
        else
        {
            payment.GatewayRef = checkout.GatewayRef;
            payment.Status = PaymentStatus.Pending;
        }

        await db.SaveChangesAsync(ct);
        return Ok(new
        {
            checkoutUrl = checkout.CheckoutUrl,
            paymentId = payment.Id,
            platformFee = fee,
            invoiceNumber = checkout.InvoiceNumber,
            useMock = doku.UseSandboxMock,
        });
    }

    /// <summary>DOKU Checkout notification (sama pola header dnPeople).</summary>
    [HttpPost("webhook/doku")]
    [AllowAnonymous]
    public Task<IActionResult> DokuWebhook(CancellationToken ct) => ProcessDokuWebhook("/api/payments/webhook/doku", ct);

    [HttpPost("webhook")]
    [AllowAnonymous]
    [Obsolete("Use POST /api/payments/webhook/doku with DOKU Signature headers.")]
    public Task<IActionResult> WebhookLegacy(CancellationToken ct) => ProcessDokuWebhook("/api/payments/webhook", ct);

    private async Task<IActionResult> ProcessDokuWebhook(string requestTarget, CancellationToken ct)
    {
        using var reader = new StreamReader(Request.Body);
        var payload = await reader.ReadToEndAsync(ct);
        var signature = Request.Headers["Signature"].FirstOrDefault();
        var requestId = Request.Headers["Request-Id"].FirstOrDefault() ?? "";
        var requestTimestamp = Request.Headers["Request-Timestamp"].FirstOrDefault() ?? "";

        if (!gateway.ValidateNotificationSignature(payload, signature, requestId, requestTimestamp, requestTarget))
        {
            return Unauthorized(new ApiError("invalid_signature", "Signature webhook DOKU tidak valid."));
        }

        var bookingIdStr = gateway.ParseBookingIdFromNotification(payload);
        var status = gateway.ParseTransactionStatusFromNotification(payload);
        if (!Guid.TryParse(bookingIdStr, out var bookingId))
        {
            return BadRequest(new ApiError("invalid_payload", "Invoice / booking tidak dikenali."));
        }

        if (!string.Equals(status, "SUCCESS", StringComparison.OrdinalIgnoreCase))
        {
            return Ok(new { received = true, ignored = status });
        }

        var applied = await ApplySuccessfulPaymentAsync(bookingId, payload, ct);
        if (!applied) return NotFound();

        return Ok(new { received = true });
    }

    /// <summary>Sinkron status setelah redirect dari halaman DOKU (polling Check Status API).</summary>
    [HttpPost("sync/{bookingId:guid}")]
    [Authorize]
    public async Task<IActionResult> Sync(Guid bookingId, CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        var booking = await db.Bookings.Include(b => b.Payment).FirstOrDefaultAsync(b => b.Id == bookingId, ct);
        if (booking is null) return NotFound();
        if (booking.UserId != userId) return Forbid();
        if (booking.Status == BookingStatus.Paid) return Ok(new { status = "paid" });

        var invoice = DokuInvoice.ForBooking(bookingId);
        var remote = await gateway.QueryOrderStatusAsync(invoice, ct);
        if (string.Equals(remote, "SUCCESS", StringComparison.OrdinalIgnoreCase))
        {
            await ApplySuccessfulPaymentAsync(bookingId, $"{{\"sync\":true,\"invoice\":\"{invoice}\"}}", ct);
            return Ok(new { status = "paid" });
        }

        return Ok(new { status = remote ?? "pending" });
    }

    /// <summary>Simulate successful payment in sandbox (development only).</summary>
    [HttpPost("mock/complete/{bookingId:guid}")]
    [Authorize]
    public async Task<IActionResult> MockComplete(Guid bookingId, CancellationToken ct)
    {
        if (!dokuOptions.Value.UseSandboxMock)
        {
            return BadRequest(new ApiError("mock_disabled", "Mock payment hanya saat Doku__UseSandboxMock=true."));
        }

        var userId = HttpContext.GetUserId();
        var booking = await db.Bookings.Include(b => b.Payment).FirstOrDefaultAsync(b => b.Id == bookingId, ct);
        if (booking is null) return NotFound();
        if (booking.UserId != userId) return Forbid();

        await ApplySuccessfulPaymentAsync(bookingId, "{\"mock\":true}", ct);
        await db.Entry(booking).ReloadAsync(ct);
        return Ok(booking);
    }

    private async Task<bool> ApplySuccessfulPaymentAsync(Guid bookingId, string auditPayload, CancellationToken ct)
    {
        var booking = await db.Bookings.Include(b => b.Payment).FirstOrDefaultAsync(b => b.Id == bookingId, ct);
        if (booking is null) return false;
        if (booking.Status == BookingStatus.Paid && booking.Payment?.Status is PaymentStatus.Held or PaymentStatus.Released)
        {
            return true;
        }

        booking.Status = BookingStatus.Paid;
        var fee = BusinessRules.CalculatePlatformFee(booking.TotalAmount, settings.Value.PlatformFeePercent);
        if (booking.Payment is null)
        {
            booking.Payment = new Payment
            {
                Id = Guid.NewGuid(),
                BookingId = bookingId,
                Amount = booking.TotalAmount,
                PlatformFee = fee,
                Status = PaymentStatus.Held,
                HeldAt = DateTime.UtcNow,
                GatewayRef = DokuInvoice.ForBooking(bookingId)
            };
            db.Payments.Add(booking.Payment);
        }
        else
        {
            booking.Payment.Status = PaymentStatus.Held;
            booking.Payment.HeldAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(ct);
        await notify.NotifyAsync(
            booking.UserId,
            NotificationType.Payment,
            "Pembayaran berhasil",
            "Booking sudah dibayar. Siap jalan!",
            ct);
        await notify.NotifyAsync(
            booking.PartnerId,
            NotificationType.Payment,
            "Pembayaran diterima",
            "Booking sudah dibayar.",
            ct);
        await audit.LogAsync(null, "payment_settled", "payment", booking.Payment?.Id.ToString(), auditPayload, ct);
        return true;
    }
}
