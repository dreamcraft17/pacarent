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
[Route("api/bookings")]
[Authorize]
public class BookingsController(
    PacaRentDbContext db,
    INotificationService notify,
    IAuditService audit,
    IOptionsMonitor<PacaRentSettings> settings) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        if (userId is null) return Unauthorized();
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        IQueryable<Booking> q = db.Bookings.AsNoTracking().Include(b => b.Category).Include(b => b.Payment);
        q = role == UserRole.Partner.ToString()
            ? q.Where(b => b.PartnerId == userId)
            : q.Where(b => b.UserId == userId);

        var items = await q.OrderByDescending(b => b.CreatedAt).Take(50).ToListAsync(ct);
        return Ok(items);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookingRequest req, CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        if (userId is null) return Unauthorized();

        if (!BusinessRules.IsValidMeetingLocation(req.MeetingLocation))
        {
            return BadRequest(new ApiError("location_invalid", "Isi lokasi pertemuan (min. 3 karakter)."));
        }

        var partner = await db.Users.Include(u => u.PartnerProfile)
            .FirstOrDefaultAsync(u => u.Id == req.PartnerId && u.Role == UserRole.Partner, ct);
        if (partner?.PartnerProfile?.VerificationStatus != VerificationStatus.Approved)
        {
            return BadRequest(new ApiError("partner_unavailable", "Mitra tidak tersedia."));
        }

        var subscription = await db.Subscriptions
            .Where(s => s.UserId == userId && s.Status != SubscriptionStatus.Expired)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync(ct);
        var tier = BusinessRules.EffectiveTier(subscription);
        var activeStatuses = new[] { BookingStatus.PendingPartner, BookingStatus.Accepted, BookingStatus.Paid, BookingStatus.InProgress };
        var activeCount = await db.Bookings.CountAsync(b => b.UserId == userId && activeStatuses.Contains(b.Status), ct);
        var cap = BusinessRules.GetActiveBookingCap(tier);
        if (activeCount >= cap)
        {
            return Conflict(new ApiError(
                "booking_cap_reached",
                $"Kamu sudah punya {cap} booking aktif di paket Gratis. Upgrade ke Plus di halaman Membership untuk booking unlimited."));
        }

        var total = BusinessRules.CalculateTotal(partner.PartnerProfile.HourlyRate, req.DurationHours);
        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            UserId = userId.Value,
            PartnerId = req.PartnerId,
            CategoryId = req.CategoryId,
            ScheduledAt = req.ScheduledAt.ToUniversalTime(),
            DurationHours = req.DurationHours,
            MeetingLocation = req.MeetingLocation.Trim(),
            Notes = req.Notes,
            Status = BookingStatus.PendingPartner,
            PartnerRespondBy = DateTime.UtcNow.AddHours(BusinessRules.PartnerResponseHours),
            TotalAmount = total,
            IsPriorityBooking = tier == SubscriptionTier.Pro
        };
        db.Bookings.Add(booking);
        await db.SaveChangesAsync(ct);
        await notify.NotifyAsync(req.PartnerId, NotificationType.Booking, "Booking baru", "Anda menerima permintaan booking baru.", ct);
        await audit.LogAsync(userId, "create_booking", "booking", booking.Id.ToString(), null, ct);
        return Ok(booking);
    }

    [HttpPost("{id:guid}/accept")]
    public async Task<IActionResult> Accept(Guid id, CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        var booking = await db.Bookings.FirstOrDefaultAsync(b => b.Id == id, ct);
        if (booking is null) return NotFound();
        if (booking.PartnerId != userId) return Forbid();
        if (!BusinessRules.CanTransition(booking.Status, BookingStatus.Accepted))
        {
            return BadRequest(new ApiError("invalid_status", "Status booking tidak valid."));
        }

        booking.Status = BookingStatus.Accepted;
        if (settings.CurrentValue.SkipBookingPayment)
        {
            booking.Status = BookingStatus.Paid;
        }

        await db.SaveChangesAsync(ct);
        var userMsg = settings.CurrentValue.SkipBookingPayment
            ? "Mitra menerima booking Anda. Pembayaran belum aktif (early access)—silakan koordinasi jadwal."
            : "Mitra menerima booking Anda. Silakan bayar.";
        await notify.NotifyAsync(booking.UserId, NotificationType.Booking, "Booking diterima", userMsg, ct);
        await audit.LogAsync(userId, "accept_booking", "booking", id.ToString(), null, ct);
        return Ok(booking);
    }

    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        var booking = await db.Bookings.FirstOrDefaultAsync(b => b.Id == id, ct);
        if (booking is null) return NotFound();
        if (booking.PartnerId != userId) return Forbid();
        booking.Status = BookingStatus.Cancelled;
        await db.SaveChangesAsync(ct);
        await notify.NotifyAsync(booking.UserId, NotificationType.Booking, "Booking ditolak", "Mitra menolak booking.", ct);
        return Ok(booking);
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id, CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        var booking = await db.Bookings.Include(b => b.Payment).FirstOrDefaultAsync(b => b.Id == id, ct);
        if (booking is null) return NotFound();
        if (booking.UserId != userId && booking.PartnerId != userId) return Forbid();
        if (settings.CurrentValue.SkipBookingPayment && booking.Status == BookingStatus.Accepted)
        {
            booking.Status = BookingStatus.Paid;
        }

        if (booking.Status is not BookingStatus.InProgress and not BookingStatus.Paid)
        {
            return BadRequest(new ApiError("invalid_status", "Booking belum bisa diselesaikan."));
        }

        booking.Status = BookingStatus.Completed;
        booking.CompletedAt = DateTime.UtcNow;
        booking.ClaimDeadline = DateTime.UtcNow.AddHours(BusinessRules.ClaimWindowHours);
        if (booking.Payment is not null && booking.Payment.Status == PaymentStatus.Held)
        {
            // Auto-release can also happen via background job after claim window.
        }

        await db.SaveChangesAsync(ct);
        await notify.NotifyAsync(booking.PartnerId, NotificationType.Booking, "Layanan selesai", "Booking ditandai selesai.", ct);
        await notify.NotifyAsync(booking.UserId, NotificationType.Booking, "Layanan selesai", "Terima kasih. Silakan beri ulasan.", ct);
        await audit.LogAsync(userId, "complete_booking", "booking", id.ToString(), null, ct);
        return Ok(new { booking, emergency = new { settings.CurrentValue.EmergencyHelpUrl, settings.CurrentValue.EmergencyHelpLabel } });
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        var booking = await db.Bookings.Include(b => b.Payment).FirstOrDefaultAsync(b => b.Id == id, ct);
        if (booking is null) return NotFound();
        if (booking.UserId != userId && booking.PartnerId != userId) return Forbid();

        var hoursUntil = (booking.ScheduledAt - DateTime.UtcNow).TotalHours;
        var refundPct = BusinessRules.RefundPercentBeforeStart(hoursUntil);

        booking.Status = booking.Payment?.Status == PaymentStatus.Held
            ? BookingStatus.Refunded
            : BookingStatus.Cancelled;

        if (booking.Payment is not null && booking.Payment.Status == PaymentStatus.Held)
        {
            booking.Payment.Status = refundPct > 0 ? PaymentStatus.Refunded : PaymentStatus.Held;
        }

        await db.SaveChangesAsync(ct);
        await audit.LogAsync(userId, "cancel_booking", "booking", id.ToString(), new { refundPct }, ct);
        return Ok(new { booking, refundPercent = refundPct });
    }

    [HttpGet("policy/cancellation")]
    [AllowAnonymous]
    public IActionResult CancellationPolicy() => Ok(new
    {
        rules = new[]
        {
            new { hoursBefore = 48, refundPercent = 100 },
            new { hoursBefore = 24, refundPercent = 75 },
            new { hoursBefore = 12, refundPercent = 50 },
            new { hoursBefore = 0, refundPercent = 0 }
        }
    });
}
