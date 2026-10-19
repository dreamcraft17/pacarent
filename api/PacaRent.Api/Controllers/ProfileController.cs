using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PacaRent.Api.Extensions;
using PacaRent.Api.Models;
using PacaRent.Core.Rules;
using PacaRent.Infra.Data;
using PacaRent.Infra.Services;

namespace PacaRent.Api.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController(PacaRentDbContext db, IAuditService audit) : ControllerBase
{
    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateProfileRequest req, CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        if (userId is null) return Unauthorized();
        if (!BusinessRules.IsAdult(req.BirthDate))
        {
            return BadRequest(new ApiError("underage", "Usia minimal 18 tahun."));
        }

        var profile = await db.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId, ct);
        if (profile is null) return NotFound();
        profile.FullName = req.FullName.Trim();
        profile.City = req.City.Trim();
        profile.PhotoUrl = req.PhotoUrl;
        profile.EmergencyContactName = req.EmergencyContactName;
        profile.EmergencyContactPhone = req.EmergencyContactPhone;
        profile.BirthDate = req.BirthDate;
        await db.SaveChangesAsync(ct);
        await audit.LogAsync(userId, "update_profile", "user_profile", userId.ToString(), null, ct);
        return Ok(profile);
    }

    private static readonly HashSet<string> AllowedPhotoTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp",
    };

    [HttpPost("photo")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> UploadPhoto(IFormFile file, CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        if (userId is null) return Unauthorized();
        if (file.Length == 0 || file.Length > 5 * 1024 * 1024)
        {
            return BadRequest(new ApiError("invalid_file", "Foto maks 5MB."));
        }
        if (!AllowedPhotoTypes.Contains(file.ContentType))
        {
            return BadRequest(new ApiError("invalid_file_type", "Format foto harus JPEG, PNG, atau WebP."));
        }

        var profile = await db.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId, ct);
        if (profile is null) return NotFound();

        await using var ms = new MemoryStream();
        await file.CopyToAsync(ms, ct);
        profile.PhotoBlob = ms.ToArray();
        profile.PhotoContentType = file.ContentType;
        profile.PhotoUrl = $"/api/profile/{userId}/photo";
        await db.SaveChangesAsync(ct);
        await audit.LogAsync(userId, "upload_profile_photo", "user_profile", userId.ToString(), null, ct);
        return Ok(new { photoUrl = profile.PhotoUrl });
    }

    [HttpGet("{userId:guid}/photo")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPhoto(Guid userId, CancellationToken ct)
    {
        var profile = await db.UserProfiles.AsNoTracking()
            .Where(p => p.UserId == userId)
            .Select(p => new { p.PhotoBlob, p.PhotoContentType })
            .FirstOrDefaultAsync(ct);
        if (profile?.PhotoBlob is null) return NotFound();
        return File(profile.PhotoBlob, profile.PhotoContentType ?? "application/octet-stream");
    }

    [HttpGet("export")]
    public async Task<IActionResult> ExportData(CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        if (userId is null) return Unauthorized();
        var user = await db.Users.AsNoTracking()
            .Include(u => u.Profile)
            .Include(u => u.PartnerProfile)
            .FirstOrDefaultAsync(u => u.Id == userId, ct);
        var bookings = await db.Bookings.AsNoTracking()
            .Where(b => b.UserId == userId || b.PartnerId == userId)
            .ToListAsync(ct);
        return Ok(new { user, bookings });
    }

    [HttpDelete]
    public async Task<IActionResult> RequestDeletion(CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        if (userId is null) return Unauthorized();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user is null) return NotFound();
        user.Status = Core.Enums.UserStatus.Blocked;
        user.Email = $"deleted-{userId}@pacarent.local";
        user.Phone = null;
        await db.SaveChangesAsync(ct);
        await audit.LogAsync(userId, "data_deletion_request", "user", userId.ToString(), null, ct);
        return Ok(new { message = "Permintaan penghapusan dicatat; akun dinonaktifkan." });
    }
}
