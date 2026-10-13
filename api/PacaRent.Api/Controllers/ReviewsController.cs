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
[Route("api/reviews")]
[Authorize]
public class ReviewsController(PacaRentDbContext db, IAuditService audit) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReviewRequest req, CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        if (userId is null) return Unauthorized();
        if (req.Rating is < 1 or > 5)
        {
            return BadRequest(new ApiError("rating_invalid", "Rating 1-5."));
        }

        var booking = await db.Bookings.FirstOrDefaultAsync(b => b.Id == req.BookingId, ct);
        if (booking is null) return NotFound();
        if (booking.Status != BookingStatus.Completed)
        {
            return BadRequest(new ApiError("not_completed", "Ulasan hanya setelah layanan selesai."));
        }

        if (booking.UserId != userId && booking.PartnerId != userId)
        {
            return Forbid();
        }

        if (req.TargetId != booking.UserId && req.TargetId != booking.PartnerId)
        {
            return BadRequest(new ApiError("invalid_target", "Target ulasan tidak valid."));
        }

        var exists = await db.Reviews.AnyAsync(r => r.BookingId == req.BookingId && r.ReviewerId == userId, ct);
        if (exists)
        {
            return Conflict(new ApiError("already_reviewed", "Anda sudah memberi ulasan."));
        }

        var review = new Review
        {
            Id = Guid.NewGuid(),
            BookingId = req.BookingId,
            ReviewerId = userId.Value,
            TargetId = req.TargetId,
            Rating = req.Rating,
            Comment = req.Comment?.Trim()
        };
        db.Reviews.Add(review);
        await db.SaveChangesAsync(ct);
        await audit.LogAsync(userId, "create_review", "review", review.Id.ToString(), null, ct);
        return Ok(review);
    }
}
