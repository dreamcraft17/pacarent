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

namespace PacaRent.Api.Controllers;

/// <summary>Membership langganan (Plus/Pro untuk customer, PendampingPro untuk mitra) + boost consumable.
/// Harga masih TBD — lihat docs/MONETIZATION-SUBSCRIPTION.md. Pembayaran berulang memakai pola mock
/// yang sama dengan booking (Doku__UseSandboxMock) karena belum ada integrasi recurring billing asli.</summary>
[ApiController]
[Route("api/subscriptions")]
public class SubscriptionsController(
    PacaRentDbContext db,
    IOptions<DokuSettings> dokuOptions) : ControllerBase
{
    private static readonly BookingStatus[] ActiveBookingStatuses =
    [
        BookingStatus.PendingPartner,
        BookingStatus.Accepted,
        BookingStatus.Paid,
        BookingStatus.InProgress,
    ];

    [HttpGet("plans")]
    [AllowAnonymous]
    public IActionResult Plans() => Ok(new[]
    {
        new SubscriptionPlanDto(
            SubscriptionTier.Free.ToString(),
            "Gratis",
            "Coba dulu — booking dasar",
            [$"Jelajahi profil", $"Maksimal {BusinessRules.FreeTierActiveBookingCap} booking aktif", "Filter kota & kategori"],
            0m,
            "Selamanya gratis",
            "Customer"),
        new SubscriptionPlanDto(
            SubscriptionTier.Plus.ToString(),
            "Plus",
            "Minus one fix, tanpa batas",
            ["Booking aktif unlimited", "Semua fitur Gratis", "Badge Plus"],
            BusinessRules.PlusMonthlyPriceIdr,
            "TBD — harga uji coba",
            "Customer"),
        new SubscriptionPlanDto(
            SubscriptionTier.Pro.ToString(),
            "Pro",
            "Booking kamu diprioritaskan",
            ["Semua fitur Plus", "Badge Prioritas di booking", "Notifikasi diprioritaskan ke mitra"],
            BusinessRules.ProMonthlyPriceIdr,
            "TBD — harga uji coba",
            "Customer"),
        new SubscriptionPlanDto(
            SubscriptionTier.PendampingPro.ToString(),
            "Pendamping Pro",
            "Muncul pas kondangan season",
            ["Boost listing 24 jam (1×/bulan)", "Badge Verified+", "Stats agregat (jumlah view profil)"],
            BusinessRules.PendampingProMonthlyPriceIdr,
            "TBD — harga uji coba",
            "Partner"),
    });

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        if (userId is null) return Unauthorized();

        var subscription = await CurrentSubscriptionAsync(userId.Value, ct);
        var tier = BusinessRules.EffectiveTier(subscription);
        var activeCount = await db.Bookings.CountAsync(
            b => b.UserId == userId && ActiveBookingStatuses.Contains(b.Status), ct);

        return Ok(new SubscriptionMeResponse(
            tier.ToString(),
            subscription?.Status.ToString() ?? SubscriptionStatus.Expired.ToString(),
            subscription?.CurrentPeriodEnd,
            subscription?.BoostUsedThisPeriod ?? false,
            activeCount,
            BusinessRules.GetActiveBookingCap(tier)));
    }

    [HttpPost("checkout")]
    [Authorize]
    public async Task<IActionResult> Checkout([FromBody] SubscribeRequest req, CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        if (userId is null) return Unauthorized();
        if (!Enum.TryParse<SubscriptionTier>(req.Tier, true, out var tier) || tier == SubscriptionTier.Free)
        {
            return BadRequest(new ApiError("invalid_tier", "Paket tidak dikenali."));
        }

        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (tier == SubscriptionTier.PendampingPro && role != UserRole.Partner.ToString())
        {
            return BadRequest(new ApiError("role_mismatch", "Pendamping Pro hanya untuk mitra."));
        }

        if (tier is SubscriptionTier.Plus or SubscriptionTier.Pro && role == UserRole.Partner.ToString())
        {
            return BadRequest(new ApiError("role_mismatch", "Plus/Pro untuk customer — mitra pakai Pendamping Pro."));
        }

        if (!dokuOptions.Value.UseSandboxMock)
        {
            return BadRequest(new ApiError(
                "subscription_billing_not_configured",
                "Pembayaran langganan berulang belum tersedia di luar mode sandbox."));
        }

        var now = DateTime.UtcNow;
        var subscription = new Subscription
        {
            Id = Guid.NewGuid(),
            UserId = userId.Value,
            Tier = tier,
            Status = SubscriptionStatus.Pending,
            StartedAt = now,
            CurrentPeriodEnd = now.AddDays(BusinessRules.SubscriptionPeriodDays),
        };
        db.Subscriptions.Add(subscription);
        await db.SaveChangesAsync(ct);

        return Ok(new
        {
            subscriptionId = subscription.Id,
            tier = tier.ToString(),
            priceIdr = BusinessRules.MonthlyPriceIdr(tier),
            useMock = dokuOptions.Value.UseSandboxMock,
        });
    }

    /// <summary>Simulate successful subscription payment in sandbox (development only) — mirrors
    /// PaymentsController.MockComplete.</summary>
    [HttpPost("mock/complete/{subscriptionId:guid}")]
    [Authorize]
    public async Task<IActionResult> MockComplete(Guid subscriptionId, CancellationToken ct)
    {
        if (!dokuOptions.Value.UseSandboxMock)
        {
            return BadRequest(new ApiError("mock_disabled", "Mock payment hanya saat Doku__UseSandboxMock=true."));
        }

        var userId = HttpContext.GetUserId();
        var subscription = await db.Subscriptions.FirstOrDefaultAsync(s => s.Id == subscriptionId, ct);
        if (subscription is null) return NotFound();
        if (subscription.UserId != userId) return Forbid();

        if (subscription.Status != SubscriptionStatus.Active)
        {
            subscription.Status = SubscriptionStatus.Active;
            subscription.GatewayRef = $"MOCK-{subscriptionId:N}";
            await db.SaveChangesAsync(ct);
        }

        return Ok(subscription);
    }

    [HttpPost("cancel")]
    [Authorize]
    public async Task<IActionResult> Cancel(CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        if (userId is null) return Unauthorized();

        var subscription = await CurrentSubscriptionAsync(userId.Value, ct);
        if (subscription is null || !BusinessRules.IsEntitled(subscription))
        {
            return BadRequest(new ApiError("no_active_subscription", "Tidak ada langganan aktif."));
        }

        subscription.Status = SubscriptionStatus.Cancelled;
        subscription.CancelledAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return Ok(subscription);
    }

    [HttpPost("boost")]
    [Authorize]
    public async Task<IActionResult> Boost(CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        if (userId is null) return Unauthorized();

        var subscription = await CurrentSubscriptionAsync(userId.Value, ct);
        if (subscription is null
            || !BusinessRules.IsEntitled(subscription)
            || subscription.Tier != SubscriptionTier.PendampingPro)
        {
            return BadRequest(new ApiError("boost_requires_pendamping_pro", "Boost hanya untuk mitra Pendamping Pro."));
        }

        if (subscription.BoostUsedThisPeriod)
        {
            return BadRequest(new ApiError("boost_already_used", "Jatah boost bulan ini sudah dipakai."));
        }

        var now = DateTime.UtcNow;
        var boost = new BoostActivation
        {
            Id = Guid.NewGuid(),
            PartnerId = userId.Value,
            ActivatedAt = now,
            ExpiresAt = now.AddHours(BusinessRules.BoostDurationHours),
        };
        db.BoostActivations.Add(boost);
        subscription.BoostUsedThisPeriod = true;
        await db.SaveChangesAsync(ct);
        return Ok(new { boost.ExpiresAt });
    }

    [HttpGet("stats")]
    [Authorize]
    public async Task<IActionResult> Stats(CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        if (userId is null) return Unauthorized();

        var subscription = await CurrentSubscriptionAsync(userId.Value, ct);
        if (subscription is null
            || !BusinessRules.IsEntitled(subscription)
            || subscription.Tier != SubscriptionTier.PendampingPro)
        {
            return BadRequest(new ApiError("stats_requires_pendamping_pro", "Stats hanya untuk mitra Pendamping Pro."));
        }

        var profileViewCount = await db.ProfileViews.CountAsync(v => v.PartnerId == userId, ct);
        var bookingCount = await db.Bookings.CountAsync(b => b.PartnerId == userId, ct);
        return Ok(new { profileViewCount, bookingCount });
    }

    private Task<Subscription?> CurrentSubscriptionAsync(Guid userId, CancellationToken ct) =>
        db.Subscriptions
            .Where(s => s.UserId == userId && s.Status != SubscriptionStatus.Expired)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync(ct);
}
