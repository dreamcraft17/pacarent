using Microsoft.EntityFrameworkCore;
using PacaRent.Core.Entities;
using PacaRent.Core.Enums;

namespace PacaRent.Infra.Data;

/// <summary>Sample partner for local UI preview (in-memory dev only).</summary>
public static class DemoDataSeeder
{
    public static async Task SeedDemoPartnerAsync(PacaRentDbContext db, CancellationToken ct = default)
    {
        if (await db.Users.AnyAsync(u => u.Email == "mitra@pacarent.local", ct))
        {
            await EnsureDemoPartnerCategoriesAsync(db, ct);
            return;
        }

        var id = Guid.NewGuid();
        var user = new User
        {
            Id = id,
            Email = "mitra@pacarent.local",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Mitra123!"),
            Role = UserRole.Partner,
            TermsAccepted = true,
            TermsAcceptedAt = DateTime.UtcNow,
            Profile = new UserProfile
            {
                UserId = id,
                FullName = "Rina — Sewa Pacar",
                BirthDate = new DateOnly(1998, 5, 20),
                City = "Jakarta"
            },
            PartnerProfile = new PartnerProfile
            {
                UserId = id,
                VerificationStatus = VerificationStatus.Approved,
                VerifiedAt = DateTime.UtcNow,
                Bio = "Sewa pacar untuk kencan, nongkrong, atau damping acara keluarga. Hangout, dinner date, photoshoot couple.",
                HourlyRate = 150_000m
            }
        };
        db.Users.Add(user);
        var catIds = await db.Categories.Select(c => c.Id).ToListAsync(ct);
        foreach (var catId in catIds)
        {
            db.PartnerCategories.Add(new PartnerCategory { PartnerId = id, CategoryId = catId });
        }

        await db.SaveChangesAsync(ct);
    }

    public static async Task EnsureDemoPartnerCategoriesAsync(PacaRentDbContext db, CancellationToken ct = default)
    {
        var user = await db.Users
            .Include(u => u.PartnerProfile!)
            .ThenInclude(p => p!.PartnerCategories)
            .FirstOrDefaultAsync(u => u.Email == "mitra@pacarent.local", ct);
        if (user?.PartnerProfile is null)
        {
            return;
        }

        var catIds = await db.Categories.Select(c => c.Id).ToListAsync(ct);
        var linked = user.PartnerProfile.PartnerCategories.Select(pc => pc.CategoryId).ToHashSet();
        var added = false;
        foreach (var catId in catIds)
        {
            if (linked.Contains(catId))
            {
                continue;
            }

            db.PartnerCategories.Add(new PartnerCategory { PartnerId = user.Id, CategoryId = catId });
            added = true;
        }

        if (added)
        {
            await db.SaveChangesAsync(ct);
        }
    }
}
