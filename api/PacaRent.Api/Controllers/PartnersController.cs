using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PacaRent.Api.Extensions;
using PacaRent.Api.Models;
using PacaRent.Core.Entities;
using PacaRent.Core.Enums;
using PacaRent.Core.Rules;
using PacaRent.Infra.Data;
using PacaRent.Infra.Services;

namespace PacaRent.Api.Controllers;

[ApiController]
[Route("api/partners")]
public class PartnersController(
    PacaRentDbContext db,
    IDocumentStorageService documents,
    INotificationService notify,
    IAuditService audit) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Search(
        [FromQuery] int? category,
        [FromQuery] string? city,
        [FromQuery] DateTime? date,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        CancellationToken ct)
    {
        var query = db.Users.AsNoTracking()
            .Where(u => u.Role == UserRole.Partner && u.Status == UserStatus.Active)
            .Where(u => u.PartnerProfile!.VerificationStatus == VerificationStatus.Approved)
            .Include(u => u.Profile)
            .Include(u => u.PartnerProfile)!.ThenInclude(p => p!.PartnerCategories).ThenInclude(pc => pc.Category)
            .AsQueryable();

        if (category is not null)
        {
            query = query.Where(u => u.PartnerProfile!.PartnerCategories.Any(c => c.CategoryId == category));
        }

        if (!string.IsNullOrWhiteSpace(city))
        {
            var c = city.Trim().ToLowerInvariant();
            query = query.Where(u =>
                u.Profile!.City.ToLower().Contains(c)
                || c.Contains(u.Profile!.City.ToLower()));
        }

        if (minPrice is not null)
        {
            query = query.Where(u => u.PartnerProfile!.HourlyRate >= minPrice);
        }

        if (maxPrice is not null)
        {
            query = query.Where(u => u.PartnerProfile!.HourlyRate <= maxPrice);
        }

        var partners = await query.Take(100).ToListAsync(ct);
        var partnerIds = partners.Select(p => p.Id).ToList();

        var ratings = await db.Reviews.AsNoTracking()
            .Where(r => partnerIds.Contains(r.TargetId))
            .GroupBy(r => r.TargetId)
            .Select(g => new { PartnerId = g.Key, Avg = g.Average(x => x.Rating), Count = g.Count() })
            .ToDictionaryAsync(x => x.PartnerId, ct);

        var now = DateTime.UtcNow;
        var boostedIds = (await db.BoostActivations.AsNoTracking()
                .Where(b => partnerIds.Contains(b.PartnerId) && b.ExpiresAt > now)
                .Select(b => b.PartnerId)
                .Distinct()
                .ToListAsync(ct))
            .ToHashSet();
        var pendampingProIds = (await db.Subscriptions.AsNoTracking()
                .Where(s => partnerIds.Contains(s.UserId)
                            && s.Tier == SubscriptionTier.PendampingPro
                            && (s.Status == SubscriptionStatus.Active || s.Status == SubscriptionStatus.Cancelled)
                            && s.CurrentPeriodEnd > now)
                .Select(s => s.UserId)
                .Distinct()
                .ToListAsync(ct))
            .ToHashSet();

        var result = partners.Select(u =>
        {
            ratings.TryGetValue(u.Id, out var r);
            return new
            {
                u.Id,
                u.Profile!.FullName,
                u.Profile.City,
                u.Profile.PhotoUrl,
                u.PartnerProfile!.HourlyRate,
                u.PartnerProfile.Bio,
                Verified = u.PartnerProfile.VerificationStatus == VerificationStatus.Approved,
                Categories = u.PartnerProfile.PartnerCategories.Select(c => c.Category.Name),
                Rating = r?.Avg ?? 0,
                ReviewCount = r?.Count ?? 0,
                Boosted = boostedIds.Contains(u.Id),
                PendampingPro = pendampingProIds.Contains(u.Id),
            };
        }).OrderByDescending(p => p.Boosted);

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var u = await db.Users.AsNoTracking()
            .Include(x => x.Profile)
            .Include(x => x.PartnerProfile)!.ThenInclude(p => p!.PartnerCategories).ThenInclude(pc => pc.Category)
            .FirstOrDefaultAsync(x => x.Id == id && x.Role == UserRole.Partner, ct);
        if (u?.PartnerProfile?.VerificationStatus != VerificationStatus.Approved)
        {
            return NotFound();
        }

        var reviews = await db.Reviews.AsNoTracking()
            .Where(r => r.TargetId == id)
            .OrderByDescending(r => r.CreatedAt)
            .Take(20)
            .ToListAsync(ct);

        var now = DateTime.UtcNow;
        var pendampingPro = await db.Subscriptions.AsNoTracking().AnyAsync(s =>
            s.UserId == id
            && s.Tier == SubscriptionTier.PendampingPro
            && (s.Status == SubscriptionStatus.Active || s.Status == SubscriptionStatus.Cancelled)
            && s.CurrentPeriodEnd > now, ct);

        var viewerId = HttpContext.GetUserId();
        if (viewerId != id)
        {
            db.ProfileViews.Add(new ProfileView { Id = Guid.NewGuid(), PartnerId = id, ViewerId = viewerId });
            await db.SaveChangesAsync(ct);
        }

        return Ok(new { partner = u, reviews, pendampingPro });
    }

    [HttpPost("apply")]
    [Authorize]
    public async Task<IActionResult> Apply([FromForm] PartnerApplyRequest req, CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        if (userId is null) return Unauthorized();
        var uid = userId.Value;

        var user = await db.Users.Include(u => u.PartnerProfile).FirstOrDefaultAsync(u => u.Id == uid, ct);
        if (user is null) return NotFound();

        user.Role = UserRole.Partner;
        user.PartnerProfile ??= new PartnerProfile { UserId = uid };
        user.PartnerProfile.Bio = req.Bio.Trim();
        user.PartnerProfile.HourlyRate = req.HourlyRate;
        // Documents remain accepted for future verification, but are optional during MVP onboarding.
        if (req.Ktp is not null)
        {
            user.PartnerProfile.KtpFileRef = await documents.SaveEncryptedAsync(
                req.Ktp.OpenReadStream(), req.Ktp.FileName, ct);
        }

        if (req.Selfie is not null)
        {
            user.PartnerProfile.SelfieFileRef = await documents.SaveEncryptedAsync(
                req.Selfie.OpenReadStream(), req.Selfie.FileName, ct);
        }
        // MVP onboarding is immediate; verification badges/documents can be added later.
        user.PartnerProfile.VerificationStatus = VerificationStatus.Approved;
        user.PartnerProfile.RejectionReason = null;

        var existing = await db.PartnerCategories.Where(pc => pc.PartnerId == uid).ToListAsync(ct);
        db.PartnerCategories.RemoveRange(existing);
        foreach (var catId in req.CategoryIds.Distinct())
        {
            db.PartnerCategories.Add(new PartnerCategory { PartnerId = uid, CategoryId = catId });
        }

        await db.SaveChangesAsync(ct);
        await notify.NotifyAsync(uid, NotificationType.System, "Profil mitra aktif", "Profil Anda sudah aktif dan bisa menerima booking.", ct);
        await audit.LogAsync(uid, "partner_apply", "partner_profile", uid.ToString(), null, ct);
        return Ok(new { status = "active" });
    }
}
