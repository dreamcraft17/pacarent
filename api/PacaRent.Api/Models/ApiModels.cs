using PacaRent.Core.Enums;

namespace PacaRent.Api.Models;

public record ApiError(string Code, string Message, object? Detail = null);

public record AuthRegisterRequest(
    string? Email,
    string? Phone,
    string Password,
    string FullName,
    DateOnly BirthDate,
    string City,
    bool TermsAccepted,
    Gender? Gender = null);

public record AuthVerifyOtpRequest(string Destination, string Code);

public record AuthLoginRequest(string Login, string Password);

public record AuthRefreshRequest(string RefreshToken);

public record TokenResponse(
    string AccessToken,
    DateTime ExpiresAt,
    string RefreshToken,
    Guid UserId,
    string Role);

public record AuthMeProfileDto(
    string FullName,
    string City,
    string? PhotoUrl,
    string? EmergencyContactName,
    string? EmergencyContactPhone);

public record AuthMeResponse(
    Guid Id,
    string? Email,
    string? Phone,
    string Role,
    AuthMeProfileDto? Profile);

public record UpdateProfileRequest(
    string FullName,
    string City,
    string? PhotoUrl,
    string? EmergencyContactName,
    string? EmergencyContactPhone,
    DateOnly BirthDate);

public record PartnerApplyRequest(
    string Bio,
    int[] CategoryIds,
    string[] Services,
    string ServiceDescription,
    IFormFile? Ktp,
    IFormFile? Selfie);

public record CreateBookingRequest(
    Guid PartnerId,
    int CategoryId,
    DateTime ScheduledAt,
    int DurationHours,
    string MeetingLocation,
    string? Notes);

public record SendChatMessageRequest(string Text);

public record CreateConversationRequest(Guid PartnerId, string? OpeningMessage);

public record ChatMessageDto(Guid Id, Guid SenderId, string Text, DateTime SentAt);

public record CreateReviewRequest(Guid BookingId, Guid TargetId, int Rating, string? Comment);

public record CreateReportRequest(
    string TargetType,
    Guid TargetId,
    string Reason,
    string Description);

public record RejectPartnerRequest(string Reason);

public record PaymentWebhookPayload(string BookingId, string Status, string? GatewayRef);

public record SubscriptionPlanDto(
    string Tier,
    string Name,
    string Positioning,
    string[] Features,
    decimal PriceIdr,
    string PriceNote,
    string AppliesToRole);

public record SubscribeRequest(string Tier);

public record SubscriptionMeResponse(
    string Tier,
    string Status,
    DateTime? CurrentPeriodEnd,
    bool BoostUsedThisPeriod,
    int ActiveBookingCount,
    int ActiveBookingCap);
