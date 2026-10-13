using PacaRent.Core.Enums;
using PacaRent.Core.Rules;

namespace PacaRent.Tests;

public class BusinessRulesTests
{
    [Fact]
    public void IsAdult_rejects_under_18()
    {
        var today = new DateOnly(2026, 10, 12);
        Assert.False(BusinessRules.IsAdult(new DateOnly(2010, 1, 1), today));
        Assert.True(BusinessRules.IsAdult(new DateOnly(2000, 1, 1), today));
    }

    [Fact]
    public void Platform_fee_calculation()
    {
        Assert.Equal(15m, BusinessRules.CalculatePlatformFee(100m, 15m));
        Assert.Equal(85m, BusinessRules.CalculatePartnerPayout(100m, 15m));
    }

    [Theory]
    [InlineData(BookingStatus.PendingPartner, BookingStatus.Accepted, true)]
    [InlineData(BookingStatus.Paid, BookingStatus.Completed, false)]
    [InlineData(BookingStatus.InProgress, BookingStatus.Completed, true)]
    public void Booking_transitions(BookingStatus from, BookingStatus to, bool allowed)
    {
        Assert.Equal(allowed, BusinessRules.CanTransition(from, to));
    }

    [Fact]
    public void Refund_policy_tiers()
    {
        Assert.Equal(100, BusinessRules.RefundPercentBeforeStart(72));
        Assert.Equal(75, BusinessRules.RefundPercentBeforeStart(30));
        Assert.Equal(0, BusinessRules.RefundPercentBeforeStart(6));
    }

    [Fact]
    public void Meeting_location_requires_min_length()
    {
        Assert.False(BusinessRules.IsValidMeetingLocation(""));
        Assert.True(BusinessRules.IsValidMeetingLocation("Cafe di Senayan"));
        Assert.True(BusinessRules.IsValidMeetingLocation("Kencan dinner — hotel lobby"));
    }
}
