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
    IOptions<PacaRentSettings> settings) : ControllerBase
{
    [HttpPost("checkout/{bookingId:guid}")]
    [Authorize]
    public async Task<IActionResult> Checkout(Guid bookingId, CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        var booking = await db.Bookings.Include(b => b.User).FirstOrDefaultAsync(b => b.Id == bookingId, ct);
        if (booking is null) return NotFound();
        if (booking.UserId != userId) return Forbid();
        if (booking.Status != BookingStatus.Accepted)
        {
            return BadRequest(new ApiError("not_accepted", "Booking harus diterima mitra sebelum bayar."));
        }

        var fee = BusinessRules.CalculatePlatformFee(booking.TotalAmount, settings.Value.PlatformFeePercent);
        var checkout = await gateway.CreateCheckoutAsync(booking.Id, booking.TotalAmount, booking.User.Email ?? "", ct);

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
        }

        await db.SaveChangesAsync(ct);
        return Ok(new { checkoutUrl = checkout.CheckoutUrl, paymentId = payment.Id, platformFee = fee });
    }

    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> Webhook(CancellationToken ct)
    {
        using var reader = new StreamReader(Request.Body);
        var payload = await reader.ReadToEndAsync(ct);
        var signature = Request.Headers["X-Doku-Signature"].FirstOrDefault() ?? "";
        if (!gateway.ValidateWebhookSignature(payload, signature))
        {
            return Unauthorized(new ApiError("invalid_signature", "Signature webhook tidak valid."));
        }

        var bookingIdStr = gateway.ParseBookingIdFromWebhook(payload);
        var status = gateway.ParsePaymentStatusFromWebhook(payload);
        if (!Guid.TryParse(bookingIdStr, out var bookingId))
        {
            return BadRequest(new ApiError("invalid_payload", "Payload tidak valid."));
        }

        var booking = await db.Bookings.Include(b => b.Payment).FirstOrDefaultAsync(b => b.Id == bookingId, ct);
        if (booking is null) return NotFound();

        if (string.Equals(status, "SUCCESS", StringComparison.OrdinalIgnoreCase))
        {
            booking.Status = BookingStatus.Paid;
            if (booking.Payment is not null)
            {
                booking.Payment.Status = PaymentStatus.Held;
                booking.Payment.HeldAt = DateTime.UtcNow;
            }

            await db.SaveChangesAsync(ct);
            await notify.NotifyAsync(booking.UserId, NotificationType.Payment, "Pembayaran berhasil", "Dana ditahan hingga layanan selesai.", ct);
            await notify.NotifyAsync(booking.PartnerId, NotificationType.Payment, "Pembayaran diterima", "Booking sudah dibayar.", ct);
            await audit.LogAsync(null, "payment_webhook", "payment", booking.Payment?.Id.ToString(), payload, ct);
        }

        return Ok(new { received = true });
    }

    /// <summary>Simulate successful payment in sandbox (development only).</summary>
    [HttpPost("mock/complete/{bookingId:guid}")]
    [Authorize]
    public async Task<IActionResult> MockComplete(Guid bookingId, CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        var booking = await db.Bookings.Include(b => b.Payment).FirstOrDefaultAsync(b => b.Id == bookingId, ct);
        if (booking is null) return NotFound();
        if (booking.UserId != userId) return Forbid();

        booking.Status = BookingStatus.Paid;
        if (booking.Payment is null)
        {
            var fee = BusinessRules.CalculatePlatformFee(booking.TotalAmount, settings.Value.PlatformFeePercent);
            booking.Payment = new Payment
            {
                Id = Guid.NewGuid(),
                BookingId = bookingId,
                Amount = booking.TotalAmount,
                PlatformFee = fee,
                Status = PaymentStatus.Held,
                HeldAt = DateTime.UtcNow,
                GatewayRef = $"MOCK-{bookingId:N}"
            };
            db.Payments.Add(booking.Payment);
        }
        else
        {
            booking.Payment.Status = PaymentStatus.Held;
            booking.Payment.HeldAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(ct);
        return Ok(booking);
    }
}
