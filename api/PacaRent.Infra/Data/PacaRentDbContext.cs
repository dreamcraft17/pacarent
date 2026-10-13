using Microsoft.EntityFrameworkCore;
using PacaRent.Core.Entities;

namespace PacaRent.Infra.Data;

public class PacaRentDbContext(DbContextOptions<PacaRentDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<PartnerProfile> PartnerProfiles => Set<PartnerProfile>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<PartnerCategory> PartnerCategories => Set<PartnerCategory>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Report> Reports => Set<Report>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<OtpChallenge> OtpChallenges => Set<OtpChallenge>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Email).IsUnique().HasFilter("\"Email\" IS NOT NULL");
            e.HasIndex(x => x.Phone).IsUnique().HasFilter("\"Phone\" IS NOT NULL");
        });

        modelBuilder.Entity<UserProfile>(e =>
        {
            e.HasKey(x => x.UserId);
            e.HasOne(x => x.User).WithOne(x => x.Profile).HasForeignKey<UserProfile>(x => x.UserId);
        });

        modelBuilder.Entity<PartnerProfile>(e =>
        {
            e.HasKey(x => x.UserId);
            e.HasOne(x => x.User).WithOne(x => x.PartnerProfile).HasForeignKey<PartnerProfile>(x => x.UserId);
            e.Property(x => x.HourlyRate).HasPrecision(18, 2);
        });

        modelBuilder.Entity<PartnerCategory>(e =>
        {
            e.HasKey(x => new { x.PartnerId, x.CategoryId });
        });

        modelBuilder.Entity<Booking>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.TotalAmount).HasPrecision(18, 2);
            e.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Partner).WithMany().HasForeignKey(x => x.PartnerId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Payment>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.BookingId).IsUnique();
            e.Property(x => x.Amount).HasPrecision(18, 2);
            e.Property(x => x.PlatformFee).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Review>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.BookingId, x.ReviewerId }).IsUnique();
        });
    }
}
