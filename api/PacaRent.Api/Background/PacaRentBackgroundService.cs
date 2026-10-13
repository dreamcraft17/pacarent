using Microsoft.EntityFrameworkCore;
using PacaRent.Core.Enums;
using PacaRent.Core.Rules;
using PacaRent.Infra.Data;
using PacaRent.Infra.Services;

namespace PacaRent.Api.Background;

public class PacaRentBackgroundService(IServiceProvider services, ILogger<PacaRentBackgroundService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var scope = services.CreateAsyncScope();
                var db = scope.ServiceProvider.GetRequiredService<PacaRentDbContext>();
                var notify = scope.ServiceProvider.GetRequiredService<INotificationService>();
                var audit = scope.ServiceProvider.GetRequiredService<IAuditService>();
                var now = DateTime.UtcNow;

                var expiredPending = await db.Bookings
                    .Where(b => b.Status == BookingStatus.PendingPartner
                                && b.PartnerRespondBy != null
                                && b.PartnerRespondBy < now)
                    .ToListAsync(stoppingToken);

                foreach (var booking in expiredPending)
                {
                    booking.Status = BookingStatus.Cancelled;
                    await notify.NotifyAsync(booking.UserId, NotificationType.Booking,
                        "Booking dibatalkan", "Mitra tidak merespons dalam batas waktu.", stoppingToken);
                    await notify.NotifyAsync(booking.PartnerId, NotificationType.Booking,
                        "Booking dibatalkan", "Booking dibatalkan otomatis karena tidak direspons.", stoppingToken);
                    await audit.LogAsync(null, "auto_cancel", "booking", booking.Id.ToString(), null, stoppingToken);
                }

                var toRelease = await db.Bookings
                    .Include(b => b.Payment)
                    .Where(b => b.Status == BookingStatus.Completed
                                && b.Payment != null
                                && b.Payment.Status == PaymentStatus.Held
                                && b.ClaimDeadline != null
                                && b.ClaimDeadline < now)
                    .ToListAsync(stoppingToken);

                foreach (var booking in toRelease)
                {
                    booking.Payment!.Status = PaymentStatus.Released;
                    booking.Payment.ReleasedAt = now;
                    await notify.NotifyAsync(booking.PartnerId, NotificationType.Payment,
                        "Dana dicairkan", $"Pembayaran booking {booking.Id} telah dicairkan ke mitra.", stoppingToken);
                    await audit.LogAsync(null, "release_payment", "payment", booking.Payment.Id.ToString(), null, stoppingToken);
                }

                var startService = await db.Bookings
                    .Where(b => b.Status == BookingStatus.Paid && b.ScheduledAt <= now)
                    .ToListAsync(stoppingToken);

                foreach (var booking in startService)
                {
                    booking.Status = BookingStatus.InProgress;
                }

                if (expiredPending.Count + toRelease.Count + startService.Count > 0)
                {
                    await db.SaveChangesAsync(stoppingToken);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Background job error");
            }

            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
