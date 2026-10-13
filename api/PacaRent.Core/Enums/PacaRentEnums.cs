namespace PacaRent.Core.Enums;

public enum UserRole
{
    User = 0,
    Partner = 1,
    Admin = 2
}

public enum UserStatus
{
    Active = 0,
    Blocked = 1
}

public enum VerificationStatus
{
    Pending = 0,
    Approved = 1,
    Rejected = 2
}

public enum BookingStatus
{
    PendingPartner = 0,
    Accepted = 1,
    Paid = 2,
    InProgress = 3,
    Completed = 4,
    Cancelled = 5,
    Refunded = 6,
    Disputed = 7
}

public enum PaymentStatus
{
    Pending = 0,
    Held = 1,
    Released = 2,
    Refunded = 3
}

public enum ReportStatus
{
    New = 0,
    InProgress = 1,
    Resolved = 2
}

public enum ReportTargetType
{
    User = 0,
    Partner = 1,
    Booking = 2,
    Review = 3
}

public enum NotificationType
{
    Booking = 0,
    Payment = 1,
    Verification = 2,
    Report = 3,
    System = 4
}
