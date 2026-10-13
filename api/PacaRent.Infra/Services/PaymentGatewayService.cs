using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PacaRent.Core.Options;

namespace PacaRent.Infra.Services;

public record PaymentCheckoutResult(string GatewayRef, string CheckoutUrl, decimal Amount);

public interface IPaymentGatewayService
{
    Task<PaymentCheckoutResult> CreateCheckoutAsync(Guid bookingId, decimal amount, string customerEmail, CancellationToken ct = default);
    bool ValidateWebhookSignature(string payload, string signatureHeader);
    string ParseBookingIdFromWebhook(string payload);
    string ParsePaymentStatusFromWebhook(string payload);
}

/// <summary>
/// DOKU integration stub: mock checkout in dev; wire real DOKU API per latest docs before production.
/// </summary>
public class DokuPaymentGatewayService(
    IOptions<DokuSettings> dokuOptions,
    ILogger<DokuPaymentGatewayService> logger) : IPaymentGatewayService
{
    public Task<PaymentCheckoutResult> CreateCheckoutAsync(Guid bookingId, decimal amount, string customerEmail, CancellationToken ct = default)
    {
        var settings = dokuOptions.Value;
        var gatewayRef = $"DOKU-MOCK-{bookingId:N}";
        if (settings.UseSandboxMock)
        {
            var url = $"/bayar/{bookingId}?ref={gatewayRef}";
            logger.LogInformation("DOKU mock checkout booking={BookingId} amount={Amount}", bookingId, amount);
            return Task.FromResult(new PaymentCheckoutResult(gatewayRef, url, amount));
        }

        // TODO: call DOKU create payment API when credentials are configured.
        throw new InvalidOperationException("DOKU production mode belum diimplementasi. Set Doku:UseSandboxMock=true atau lengkapi integrasi.");
    }

    public bool ValidateWebhookSignature(string payload, string signatureHeader)
    {
        var secret = dokuOptions.Value.WebhookSecret;
        if (string.IsNullOrWhiteSpace(secret))
        {
            return dokuOptions.Value.UseSandboxMock;
        }

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var hash = Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(payload))).ToLowerInvariant();
        return string.Equals(hash, signatureHeader, StringComparison.OrdinalIgnoreCase);
    }

    public string ParseBookingIdFromWebhook(string payload)
    {
        using var doc = System.Text.Json.JsonDocument.Parse(payload);
        if (doc.RootElement.TryGetProperty("bookingId", out var id))
        {
            return id.GetString() ?? "";
        }

        return "";
    }

    public string ParsePaymentStatusFromWebhook(string payload)
    {
        using var doc = System.Text.Json.JsonDocument.Parse(payload);
        if (doc.RootElement.TryGetProperty("status", out var st))
        {
            return st.GetString() ?? "";
        }

        return "";
    }
}
