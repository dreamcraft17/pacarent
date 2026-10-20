using System.Text.Json;
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
[Route("api/conversations")]
[Authorize]
public class ConversationsController(
    PacaRentDbContext db,
    INotificationService notify,
    IAuditService audit) : ControllerBase
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        if (userId is null) return Unauthorized();

        var items = await db.Conversations.AsNoTracking()
            .Include(x => x.User).ThenInclude(x => x.Profile)
            .Include(x => x.Partner).ThenInclude(x => x.Profile)
            .Where(x => x.UserId == userId || x.PartnerId == userId)
            .OrderByDescending(x => x.UpdatedAt)
            .Take(100)
            .ToListAsync(ct);

        return Ok(items.Select(x => ToSummary(x, userId.Value)));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateConversationRequest req, CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        if (userId is null) return Unauthorized();
        if (req.PartnerId == userId) return BadRequest(new ApiError("invalid_partner", "Pilih profil orang lain untuk mulai chat."));

        var partner = await db.Users.Include(x => x.PartnerProfile)
            .FirstOrDefaultAsync(x => x.Id == req.PartnerId && x.Role == UserRole.Partner && x.Status == UserStatus.Active, ct);
        if (partner?.PartnerProfile?.VerificationStatus != VerificationStatus.Approved)
        {
            return BadRequest(new ApiError("partner_unavailable", "Profil pendamping ini belum tersedia."));
        }

        var conversation = await db.Conversations.FirstOrDefaultAsync(
            x => x.UserId == userId && x.PartnerId == req.PartnerId, ct);
        if (conversation is null)
        {
            conversation = new Conversation
            {
                Id = Guid.NewGuid(),
                UserId = userId.Value,
                PartnerId = req.PartnerId,
                MessagesJson = "[]",
            };
            db.Conversations.Add(conversation);
        }

        var opening = req.OpeningMessage?.Trim();
        ChatMessageDto? firstMessage = null;
        if (!string.IsNullOrWhiteSpace(opening))
        {
            if (opening.Length > 2000) return BadRequest(new ApiError("invalid_message", "Pesan maksimal 2.000 karakter."));
            var messages = ReadMessages(conversation.MessagesJson).ToList();
            firstMessage = new ChatMessageDto(Guid.NewGuid(), userId.Value, opening, DateTime.UtcNow);
            messages.Add(firstMessage);
            conversation.MessagesJson = JsonSerializer.Serialize(messages, JsonOptions);
            conversation.UpdatedAt = firstMessage.SentAt;
        }

        await db.SaveChangesAsync(ct);
        if (firstMessage is not null)
        {
            await notify.NotifyAsync(req.PartnerId, NotificationType.Booking, "Ada yang ngajak ngobrol", "Ada pesan baru di chat PacaRent kamu.", ct);
            await audit.LogAsync(userId, "send_conversation_message", "conversation", conversation.Id.ToString(), new { messageId = firstMessage.Id }, ct);
        }

        return Ok(new { id = conversation.Id });
    }

    [HttpGet("{id:guid}/messages")]
    public async Task<IActionResult> Messages(Guid id, CancellationToken ct)
    {
        var conversation = await GetConversation(id, ct);
        if (conversation is null) return NotFound();
        if (!CanAccess(conversation)) return Forbid();
        return Ok(ReadMessages(conversation.MessagesJson));
    }

    [HttpPost("{id:guid}/messages")]
    public async Task<IActionResult> Send(Guid id, [FromBody] SendChatMessageRequest req, CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        if (userId is null) return Unauthorized();
        var text = req.Text?.Trim();
        if (string.IsNullOrWhiteSpace(text) || text.Length > 2000)
        {
            return BadRequest(new ApiError("invalid_message", "Pesan wajib diisi dan maksimal 2.000 karakter."));
        }

        var conversation = await db.Conversations.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (conversation is null) return NotFound();
        if (!CanAccess(conversation)) return Forbid();

        var message = new ChatMessageDto(Guid.NewGuid(), userId.Value, text, DateTime.UtcNow);
        var messages = ReadMessages(conversation.MessagesJson).ToList();
        messages.Add(message);
        conversation.MessagesJson = JsonSerializer.Serialize(messages, JsonOptions);
        conversation.UpdatedAt = message.SentAt;
        await db.SaveChangesAsync(ct);

        var recipientId = conversation.UserId == userId ? conversation.PartnerId : conversation.UserId;
        await notify.NotifyAsync(recipientId, NotificationType.Booking, "Pesan baru", "Ada pesan baru di chat PacaRent kamu.", ct);
        await audit.LogAsync(userId, "send_conversation_message", "conversation", id.ToString(), new { messageId = message.Id }, ct);
        return Ok(message);
    }

    private async Task<Conversation?> GetConversation(Guid id, CancellationToken ct) =>
        await db.Conversations.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);

    private bool CanAccess(Conversation conversation)
    {
        var userId = HttpContext.GetUserId();
        return userId is not null && (conversation.UserId == userId || conversation.PartnerId == userId);
    }

    private static object ToSummary(Conversation conversation, Guid viewerId)
    {
        var other = conversation.UserId == viewerId ? conversation.Partner : conversation.User;
        var messages = ReadMessages(conversation.MessagesJson);
        return new
        {
            id = conversation.Id,
            person = new
            {
                id = other.Id,
                fullName = other.Profile?.FullName,
                city = other.Profile?.City,
                photoUrl = other.Profile?.PhotoUrl,
            },
            lastMessage = messages.LastOrDefault(),
            updatedAt = conversation.UpdatedAt,
        };
    }

    private static IReadOnlyList<ChatMessageDto> ReadMessages(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return Array.Empty<ChatMessageDto>();
        try { return JsonSerializer.Deserialize<List<ChatMessageDto>>(raw, JsonOptions) ?? []; }
        catch (JsonException) { return Array.Empty<ChatMessageDto>(); }
    }
}
