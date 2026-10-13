using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PacaRent.Core.Entities;
using PacaRent.Core.Rules;
using PacaRent.Infra.Data;

namespace PacaRent.Infra.Services;

public interface IOtpService
{
    Task<string> IssueAsync(string destination, CancellationToken ct = default);
    Task<bool> VerifyAsync(string destination, string code, CancellationToken ct = default);
}

public class OtpService(PacaRentDbContext db, ILogger<OtpService> logger) : IOtpService
{
    public async Task<string> IssueAsync(string destination, CancellationToken ct = default)
    {
        var code = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
        var hash = Hash(code);
        db.OtpChallenges.Add(new OtpChallenge
        {
            Id = Guid.NewGuid(),
            Destination = destination.Trim().ToLowerInvariant(),
            CodeHash = hash,
            ExpiresAt = DateTime.UtcNow.AddMinutes(BusinessRules.OtpExpiryMinutes)
        });
        await db.SaveChangesAsync(ct);
        logger.LogInformation("[OTP] destination={Destination} code={Code} (dev only)", destination, code);
        return code;
    }

    public async Task<bool> VerifyAsync(string destination, string code, CancellationToken ct = default)
    {
        var dest = destination.Trim().ToLowerInvariant();
        var challenge = await db.OtpChallenges
            .Where(o => o.Destination == dest && !o.Used && o.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync(ct);

        if (challenge is null || challenge.CodeHash != Hash(code))
        {
            return false;
        }

        challenge.Used = true;
        await db.SaveChangesAsync(ct);
        return true;
    }

    private static string Hash(string code) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(code)));
}
