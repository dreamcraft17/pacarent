using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PacaRent.Api.Extensions;
using PacaRent.Api.Models;
using PacaRent.Core.Entities;
using PacaRent.Core.Enums;
using PacaRent.Infra.Data;
using PacaRent.Infra.Services;

namespace PacaRent.Api.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController(PacaRentDbContext db, INotificationService notify, IAuditService audit) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReportRequest req, CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        if (userId is null) return Unauthorized();
        if (!Enum.TryParse<ReportTargetType>(req.TargetType, true, out var targetType))
        {
            return BadRequest(new ApiError("invalid_target_type", "Jenis laporan tidak valid."));
        }

        var report = new Report
        {
            Id = Guid.NewGuid(),
            ReporterId = userId.Value,
            TargetType = targetType,
            TargetId = req.TargetId,
            Reason = req.Reason.Trim(),
            Description = req.Description.Trim(),
            Status = ReportStatus.New
        };
        db.Reports.Add(report);
        await db.SaveChangesAsync(ct);

        var admins = await db.Users.Where(u => u.Role == UserRole.Admin).Select(u => u.Id).ToListAsync(ct);
        foreach (var adminId in admins)
        {
            await notify.NotifyAsync(adminId, NotificationType.Report, "Laporan baru", report.Reason, ct);
        }

        await audit.LogAsync(userId, "create_report", "report", report.Id.ToString(), null, ct);
        return Ok(report);
    }
}
