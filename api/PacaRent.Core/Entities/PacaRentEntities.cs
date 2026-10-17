using PacaRent.Core.Enums;

namespace PacaRent.Core.Entities;

public class User
{
    public Guid Id { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string PasswordHash { get; set; } = "";
    public UserRole Role { get; set; } = UserRole.User;
    public UserStatus Status { get; set; } = UserStatus.Active;
    public bool TermsAccepted { get; set; }
    public DateTime TermsAcceptedAt { get; set; }
    public int FailedLoginAttempts { get; set; }
    public DateTime? LoginLockedUntil { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public UserProfile? Profile { get; set; }
    public PartnerProfile? PartnerProfile { get; set; }
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}

public class UserProfile
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string FullName { get; set; } = "";
    public DateOnly BirthDate { get; set; }
    public string City { get; set; } = "";
    public string? PhotoUrl { get; set; }
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
}

public class PartnerProfile
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public VerificationStatus VerificationStatus { get; set; } = VerificationStatus.Pending;
    public string? RejectionReason { get; set; }
    public string? KtpFileRef { get; set; }
    public string? SelfieFileRef { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public string Bio { get; set; } = "";
    public decimal HourlyRate { get; set; }
    public ICollection<PartnerCategory> PartnerCategories { get; set; } = new List<PartnerCategory>();
}

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public ICollection<PartnerCategory> PartnerCategories { get; set; } = new List<PartnerCategory>();
}

public class PartnerCategory
{
    public Guid PartnerId { get; set; }
    public PartnerProfile Partner { get; set; } = null!;
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}

public class Booking
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid PartnerId { get; set; }
    public User Partner { get; set; } = null!;
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public DateTime ScheduledAt { get; set; }
    public int DurationHours { get; set; }
    public string MeetingLocation { get; set; } = "";
    public string? Notes { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.PendingPartner;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PartnerRespondBy { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? ClaimDeadline { get; set; }
    public decimal TotalAmount { get; set; }

    /// <summary>Booking dari customer dengan langganan Pro — ditandai prioritas ke mitra (Tahap membership).</summary>
    public bool IsPriorityBooking { get; set; }

    public Payment? Payment { get; set; }
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}

public class Payment
{
    public Guid Id { get; set; }
    public Guid BookingId { get; set; }
    public Booking Booking { get; set; } = null!;
    public string? GatewayRef { get; set; }
    public decimal Amount { get; set; }
    public decimal PlatformFee { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public DateTime? HeldAt { get; set; }
    public DateTime? ReleasedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Review
{
    public Guid Id { get; set; }
    public Guid BookingId { get; set; }
    public Booking Booking { get; set; } = null!;
    public Guid ReviewerId { get; set; }
    public User Reviewer { get; set; } = null!;
    public Guid TargetId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Report
{
    public Guid Id { get; set; }
    public Guid ReporterId { get; set; }
    public User Reporter { get; set; } = null!;
    public ReportTargetType TargetType { get; set; }
    public Guid TargetId { get; set; }
    public string Reason { get; set; } = "";
    public string Description { get; set; } = "";
    public ReportStatus Status { get; set; } = ReportStatus.New;
    public Guid? HandledBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class AuditLog
{
    public Guid Id { get; set; }
    public Guid? ActorId { get; set; }
    public string Action { get; set; } = "";
    public string Entity { get; set; } = "";
    public string? EntityId { get; set; }
    public string? PayloadJson { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class OtpChallenge
{
    public Guid Id { get; set; }
    public string Destination { get; set; } = "";
    public string CodeHash { get; set; } = "";
    public DateTime ExpiresAt { get; set; }
    public bool Used { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class RefreshToken
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string TokenHash { get; set; } = "";
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RevokedAt { get; set; }
}

public class Notification
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public NotificationType Type { get; set; }
    public string Title { get; set; } = "";
    public string Body { get; set; } = "";
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>Membership langganan (Plus/Pro untuk customer, PendampingPro untuk mitra).
/// Lihat docs/MONETIZATION-SUBSCRIPTION.md dan docs/research/dating-app-membership-patterns-2026-10-17.md.</summary>
public class Subscription
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public SubscriptionTier Tier { get; set; }
    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Pending;
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime CurrentPeriodEnd { get; set; }
    public DateTime? CancelledAt { get; set; }
    public bool BoostUsedThisPeriod { get; set; }
    public string? GatewayRef { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>Consumable: boost listing mitra 24 jam di grid browse (perk bulanan PendampingPro).</summary>
public class BoostActivation
{
    public Guid Id { get; set; }
    public Guid PartnerId { get; set; }
    public User Partner { get; set; } = null!;
    public DateTime ActivatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>View profil mitra — dipakai untuk stats agregat PendampingPro (bukan daftar identitas, demi privasi).</summary>
public class ProfileView
{
    public Guid Id { get; set; }
    public Guid PartnerId { get; set; }
    public User Partner { get; set; } = null!;
    public Guid? ViewerId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
