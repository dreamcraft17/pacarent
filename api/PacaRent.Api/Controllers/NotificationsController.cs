using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PacaRent.Api.Extensions;
using PacaRent.Infra.Services;

namespace PacaRent.Api.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController(INotificationService notifications) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Unread(CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        if (userId is null) return Unauthorized();
        var items = await notifications.GetUnreadAsync(userId.Value, ct);
        return Ok(items);
    }

    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        if (userId is null) return Unauthorized();
        await notifications.MarkReadAsync(userId.Value, id, ct);
        return Ok(new { read = true });
    }
}
