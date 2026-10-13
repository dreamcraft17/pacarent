using PacaRent.Core.Entities;
using PacaRent.Infra.Data;

namespace PacaRent.Infra.Services;

public interface IAuditService
{
    Task LogAsync(Guid? actorId, string action, string entity, string? entityId, object? payload = null, CancellationToken ct = default);
}

public class AuditService(PacaRentDbContext db) : IAuditService
{
    public async Task LogAsync(Guid? actorId, string action, string entity, string? entityId, object? payload = null, CancellationToken ct = default)
    {
        db.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            ActorId = actorId,
            Action = action,
            Entity = entity,
            EntityId = entityId,
            PayloadJson = payload is null ? null : System.Text.Json.JsonSerializer.Serialize(payload)
        });
        await db.SaveChangesAsync(ct);
    }
}
