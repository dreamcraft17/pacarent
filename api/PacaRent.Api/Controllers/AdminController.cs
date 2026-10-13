using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PacaRent.Api.Extensions;
using PacaRent.Api.Models;
using PacaRent.Core.Enums;
using PacaRent.Infra.Data;
using PacaRent.Infra.Services;

namespace PacaRent.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = nameof(UserRole.Admin))]
public class AdminController(
    PacaRentDbContext db,
    IDocumentStorageService documents,
    INotificationService notify,
    IAuditService audit) : ControllerBase
{
    [HttpGet("partners/pending")]
    public async Task<IActionResult> PendingPartners(CancellationToken ct)
    {
        var items = await db.PartnerProfiles.AsNoTracking()
            .Include(p => p.User).ThenInclude(u => u.Profile)
            .Include(p => p.PartnerCategories).ThenInclude(pc => pc.Category)
            .Where(p => p.VerificationStatus == VerificationStatus.Pending)
            .ToListAsync(ct);
        return Ok(items);
    }

    [HttpPost("partners/{id:guid}/approve")]
    public async Task<IActionResult> ApprovePartner(Guid id, CancellationToken ct)
    {
        var actorId = HttpContext.GetUserId();
        var profile = await db.PartnerProfiles.FirstOrDefaultAsync(p => p.UserId == id, ct);
        if (profile is null) return NotFound();
        profile.VerificationStatus = VerificationStatus.Approved;
        profile.VerifiedAt = DateTime.UtcNow;
        profile.RejectionReason = null;
        await db.SaveChangesAsync(ct);
        await notify.NotifyAsync(id, NotificationType.Verification, "Verifikasi disetujui", "Profil mitra Anda aktif.", ct);
        await audit.LogAsync(actorId, "approve_partner", "partner_profile", id.ToString(), null, ct);
        return Ok(profile);
    }

    [HttpPost("partners/{id:guid}/reject")]
    public async Task<IActionResult> RejectPartner(Guid id, [FromBody] RejectPartnerRequest req, CancellationToken ct)
    {
        var actorId = HttpContext.GetUserId();
        var profile = await db.PartnerProfiles.FirstOrDefaultAsync(p => p.UserId == id, ct);
        if (profile is null) return NotFound();
        profile.VerificationStatus = VerificationStatus.Rejected;
        profile.RejectionReason = req.Reason.Trim();
        await db.SaveChangesAsync(ct);
        await notify.NotifyAsync(id, NotificationType.Verification, "Verifikasi ditolak", req.Reason, ct);
        await audit.LogAsync(actorId, "reject_partner", "partner_profile", id.ToString(), req, ct);
        return Ok(profile);
    }

    [HttpGet("partners/{id:guid}/documents/{kind}")]
    public async Task<IActionResult> GetDocument(Guid id, string kind, CancellationToken ct)
    {
        var profile = await db.PartnerProfiles.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == id, ct);
        if (profile is null) return NotFound();
        var fileRef = kind.ToLowerInvariant() switch
        {
            "ktp" => profile.KtpFileRef,
            "selfie" => profile.SelfieFileRef,
            _ => null
        };
        if (fileRef is null) return NotFound();
        var bytes = await documents.ReadDecryptedAsync(fileRef, ct);
        return File(bytes, "application/octet-stream");
    }

    [HttpGet("reports")]
    public async Task<IActionResult> ListReports(CancellationToken ct)
    {
        var items = await db.Reports.AsNoTracking().OrderByDescending(r => r.CreatedAt).Take(100).ToListAsync(ct);
        return Ok(items);
    }

    [HttpPost("reports/{id:guid}/resolve")]
    public async Task<IActionResult> ResolveReport(Guid id, CancellationToken ct)
    {
        var actorId = HttpContext.GetUserId();
        var report = await db.Reports.FirstOrDefaultAsync(r => r.Id == id, ct);
        if (report is null) return NotFound();
        report.Status = ReportStatus.Resolved;
        report.HandledBy = actorId;
        await db.SaveChangesAsync(ct);
        await audit.LogAsync(actorId, "resolve_report", "report", id.ToString(), null, ct);
        return Ok(report);
    }

    [HttpPost("users/{id:guid}/block")]
    public async Task<IActionResult> BlockUser(Guid id, CancellationToken ct)
    {
        var actorId = HttpContext.GetUserId();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user is null) return NotFound();
        user.Status = UserStatus.Blocked;

        var activeBookings = await db.Bookings
            .Where(b => (b.UserId == id || b.PartnerId == id)
                        && b.Status != BookingStatus.Completed
                        && b.Status != BookingStatus.Cancelled
                        && b.Status != BookingStatus.Refunded)
            .ToListAsync(ct);
        foreach (var b in activeBookings)
        {
            b.Status = BookingStatus.Cancelled;
        }

        await db.SaveChangesAsync(ct);
        await audit.LogAsync(actorId, "block_user", "user", id.ToString(), null, ct);
        return Ok(new { user.Id, user.Status });
    }

    [HttpGet("payments/pending-release")]
    public async Task<IActionResult> PendingRelease(CancellationToken ct)
    {
        var items = await db.Payments.AsNoTracking()
            .Include(p => p.Booking)
            .Where(p => p.Status == PaymentStatus.Held)
            .ToListAsync(ct);
        return Ok(items);
    }

    [HttpPost("payments/{id:guid}/release")]
    public async Task<IActionResult> ManualRelease(Guid id, CancellationToken ct)
    {
        var actorId = HttpContext.GetUserId();
        var payment = await db.Payments.Include(p => p.Booking).FirstOrDefaultAsync(p => p.Id == id, ct);
        if (payment is null) return NotFound();
        payment.Status = PaymentStatus.Released;
        payment.ReleasedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        await audit.LogAsync(actorId, "manual_release", "payment", id.ToString(), null, ct);
        return Ok(payment);
    }

    [HttpGet("audit-logs")]
    public async Task<IActionResult> AuditLogs(CancellationToken ct)
    {
        var logs = await db.AuditLogs.AsNoTracking().OrderByDescending(l => l.CreatedAt).Take(200).ToListAsync(ct);
        return Ok(logs);
    }
}
