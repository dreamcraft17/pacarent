using PacaRent.Core.Entities;
using PacaRent.Core.Enums;

namespace PacaRent.Core.Rules;

public static class BusinessRules
{
    public const int MinAgeYears = 18;
    public const int MinPasswordLength = 8;
    public const int OtpLength = 6;
    public const int OtpExpiryMinutes = 5;
    public const int MaxFailedLogins = 5;
    public const int LoginLockMinutes = 15;
    public const int PartnerResponseHours = 2;
    public const int ClaimWindowHours = 24;
    public const decimal DefaultPlatformFeePercent = 15m;

    // Membership (docs/research/dating-app-membership-patterns-2026-10-17.md).
    // Harga masih TBD (lihat docs/MONETIZATION-SUBSCRIPTION.md) — nilai di bawah adalah
    // placeholder untuk demo/mock payment, bukan harga final.
    public const int FreeTierActiveBookingCap = 2;
    public const int SubscriptionPeriodDays = 30;
    public const int BoostDurationHours = 24;
    public const decimal PlusMonthlyPriceIdr = 29000m;
    public const decimal ProMonthlyPriceIdr = 59000m;
    public const decimal PendampingProMonthlyPriceIdr = 49000m;

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

    public static bool IsValidPassword(string? password) =>
        !string.IsNullOrWhiteSpace(password) && password.Length >= MinPasswordLength;

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

    /// <summary>True kalau subscription masih berlaku (belum expired, periode belum lewat).
    /// Status Cancelled tetap entitled sampai akhir periode (standar SaaS: akses jalan terus sampai periode habis).</summary>
    public static bool IsEntitled(Subscription? subscription, DateTime? now = null)
    {
        if (subscription is null) return false;
        var refNow = now ?? DateTime.UtcNow;
        return subscription.Status is SubscriptionStatus.Active or SubscriptionStatus.Cancelled
               && subscription.CurrentPeriodEnd > refNow;
    }

    public static SubscriptionTier EffectiveTier(Subscription? subscription, DateTime? now = null) =>
        IsEntitled(subscription, now) ? subscription!.Tier : SubscriptionTier.Free;

    public static int GetActiveBookingCap(SubscriptionTier tier) =>
        tier == SubscriptionTier.Free ? FreeTierActiveBookingCap : int.MaxValue;

    public static decimal MonthlyPriceIdr(SubscriptionTier tier) => tier switch
    {
        SubscriptionTier.Plus => PlusMonthlyPriceIdr,
        SubscriptionTier.Pro => ProMonthlyPriceIdr,
        SubscriptionTier.PendampingPro => PendampingProMonthlyPriceIdr,
        _ => 0m
    };
}
