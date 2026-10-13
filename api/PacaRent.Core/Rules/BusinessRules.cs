using PacaRent.Core.Enums;

namespace PacaRent.Core.Rules;

public static class BusinessRules
{
    public const int MinAgeYears = 18;
    public const int OtpLength = 6;
    public const int OtpExpiryMinutes = 5;
    public const int MaxFailedLogins = 5;
    public const int LoginLockMinutes = 15;
    public const int PartnerResponseHours = 2;
    public const int ClaimWindowHours = 24;
    public const decimal DefaultPlatformFeePercent = 15m;

    public static bool IsAdult(DateOnly birthDate, DateOnly? today = null)
    {
        var refDate = today ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var age = refDate.Year - birthDate.Year;
        if (birthDate > refDate.AddYears(-age))
        {
            age--;
        }

        return age >= MinAgeYears;
    }

    public static bool IsValidMeetingLocation(string location) =>
        !string.IsNullOrWhiteSpace(location) && location.Trim().Length >= 3;

    public static bool IsPublicMeetingLocation(string location) => IsValidMeetingLocation(location);

    public static decimal CalculateTotal(decimal hourlyRate, int durationHours) =>
        hourlyRate * durationHours;

    public static decimal CalculatePlatformFee(decimal amount, decimal feePercent) =>
        Math.Round(amount * feePercent / 100m, 2, MidpointRounding.AwayFromZero);

    public static decimal CalculatePartnerPayout(decimal amount, decimal platformFee) =>
        amount - platformFee;

    public static bool CanTransition(BookingStatus from, BookingStatus to) => (from, to) switch
    {
        (BookingStatus.PendingPartner, BookingStatus.Accepted) => true,
        (BookingStatus.PendingPartner, BookingStatus.Cancelled) => true,
        (BookingStatus.Accepted, BookingStatus.Paid) => true,
        (BookingStatus.Accepted, BookingStatus.Cancelled) => true,
        (BookingStatus.Paid, BookingStatus.InProgress) => true,
        (BookingStatus.Paid, BookingStatus.Cancelled) => true,
        (BookingStatus.Paid, BookingStatus.Refunded) => true,
        (BookingStatus.InProgress, BookingStatus.Completed) => true,
        (BookingStatus.InProgress, BookingStatus.Disputed) => true,
        (BookingStatus.Completed, BookingStatus.Disputed) => true,
        _ => false
    };

    /// <summary>Refund percent based on hours before scheduled start (displayed before payment).</summary>
    public static int RefundPercentBeforeStart(double hoursUntilStart) => hoursUntilStart switch
    {
        >= 48 => 100,
        >= 24 => 75,
        >= 12 => 50,
        _ => 0
    };
}
