using Microsoft.EntityFrameworkCore;
using PacaRent.Core.Entities;
using PacaRent.Core.Enums;
using PacaRent.Infra.Data;

namespace PacaRent.Infra.Services;

public interface INotificationService
{
    Task NotifyAsync(Guid userId, NotificationType type, string title, string body, CancellationToken ct = default);
    Task<IReadOnlyList<Notification>> GetUnreadAsync(Guid userId, CancellationToken ct = default);
    Task MarkReadAsync(Guid userId, Guid notificationId, CancellationToken ct = default);
}

public class NotificationService(PacaRentDbContext db, IEmailService email) : INotificationService
{
    public async Task NotifyAsync(Guid userId, NotificationType type, string title, string body, CancellationToken ct = default)
    {
        db.Notifications.Add(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = type,
            Title = title,
            Body = body
        });
        await db.SaveChangesAsync(ct);

        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user?.Email is not null)
        {
            await email.SendAsync(user.Email, title, body, ct);
        }
    }

    public async Task<IReadOnlyList<Notification>> GetUnreadAsync(Guid userId, CancellationToken ct = default) =>
        await db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync(ct);

    public async Task MarkReadAsync(Guid userId, Guid notificationId, CancellationToken ct = default)
    {
        var n = await db.Notifications.FirstOrDefaultAsync(x => x.Id == notificationId && x.UserId == userId, ct);
        if (n is null) return;
        n.IsRead = true;
        await db.SaveChangesAsync(ct);
    }
}
