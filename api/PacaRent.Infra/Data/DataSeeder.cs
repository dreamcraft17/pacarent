using Microsoft.EntityFrameworkCore;
using PacaRent.Core.Entities;
using PacaRent.Core.Enums;

namespace PacaRent.Infra.Data;

public static class DataSeeder
{
    public static readonly string[] DefaultCategoryNames =
    {
        "Sewa pacar",
        "Teman nongkrong",
        "Teman jalan",
        "Teman acara",
        "Makan",
        "Ngobrol",
        "Lainnya",
    };

    /// <summary>Idempotent — aman dipanggil tiap request categories (dev in-memory lama).</summary>
    public static async Task EnsureDefaultCategoriesAsync(PacaRentDbContext db, CancellationToken ct = default)
    {
        var added = false;
        foreach (var name in DefaultCategoryNames)
        {
            if (await db.Categories.AnyAsync(c => c.Name == name, ct))
            {
                continue;
            }

            db.Categories.Add(new Category { Name = name });
            added = true;
        }

        if (added)
        {
            await db.SaveChangesAsync(ct);
        }
    }

    public static async Task SeedAsync(PacaRentDbContext db, CancellationToken ct = default)
    {
        await EnsureDefaultCategoriesAsync(db, ct);

        if (await db.Users.AnyAsync(u => u.Role == UserRole.Admin, ct))
        {
            return;
        }

        var adminId = Guid.NewGuid();
        var admin = new User
        {
            Id = adminId,
            Email = "admin@pacarent.local",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            Role = UserRole.Admin,
            TermsAccepted = true,
            TermsAcceptedAt = DateTime.UtcNow
        };
        admin.Profile = new UserProfile
        {
            UserId = adminId,
            FullName = "Admin PacaRent",
            BirthDate = new DateOnly(1990, 1, 1),
            City = "Jakarta"
        };
        db.Users.Add(admin);
        await db.SaveChangesAsync(ct);
    }
}
