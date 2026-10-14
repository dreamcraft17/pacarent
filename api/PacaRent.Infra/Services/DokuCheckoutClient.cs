using System.Globalization;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PacaRent.Core.Options;

namespace PacaRent.Infra.Services;

/// <summary>
/// DOKU Checkout Non-SNAP — same signing &amp; payload shape as dnPeople (<c>backend/src/lib/doku.ts</c>).
/// </summary>
public static class DokuInvoice
{
    public static string ForBooking(Guid bookingId) => $"PR-{bookingId:N}".ToUpperInvariant();

    public static bool TryParseBookingId(string invoiceNumber, out Guid bookingId)
    {
        bookingId = default;
        if (string.IsNullOrWhiteSpace(invoiceNumber)) return false;
        var raw = invoiceNumber.Trim();
        if (raw.StartsWith("PR-", StringComparison.OrdinalIgnoreCase))
        {
            raw = raw[3..];
        }

        return Guid.TryParse(raw, out bookingId);
    }
}

public static class DokuPhone
{
    public static string? NormalizeForDoku(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) return null;
        var digits = new string(phone.Where(char.IsDigit).ToArray());
        if (digits.Length == 0) return null;
        if (digits.StartsWith("62", StringComparison.Ordinal)) return digits;
        if (digits.StartsWith('0')) return "62" + digits[1..];
        if (digits.StartsWith('8')) return "62" + digits;
        return digits;
    }
}

public sealed class DokuCheckoutClient(
    HttpClient http,
    IOptions<DokuSettings> dokuOptions,
    ILogger<DokuCheckoutClient> logger)
{
    private readonly DokuSettings _settings = dokuOptions.Value;

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_settings.ClientId) && !string.IsNullOrWhiteSpace(_settings.SecretKey);

    public string ApiBase =>
        _settings.IsProduction ? "https://api.doku.com" : "https://api-sandbox.doku.com";

    public string NotificationUrl()
    {
        var explicitUrl = (_settings.NotificationUrl ?? "").Trim().TrimEnd('/');
        if (!string.IsNullOrEmpty(explicitUrl)) return explicitUrl;
        var apiPublic = (_settings.ApiPublicUrl ?? "").Trim().TrimEnd('/');
        return string.IsNullOrEmpty(apiPublic)
            ? "http://localhost:5000/api/payments/webhook/doku"
            : $"{apiPublic}/api/payments/webhook/doku";
    }

    public async Task<(string CheckoutUrl, string RequestId)> CreateCheckoutAsync(
        string invoiceNumber,
        long amountIdr,
        string description,
        DokuCustomer customer,
        string callbackUrl,
        CancellationToken ct)
    {
        if (!IsConfigured)
        {
            throw new InvalidOperationException("DOKU belum dikonfigurasi (ClientId / SecretKey).");
        }

        const string target = "/checkout/v1/payment";
        var requestId = Guid.NewGuid().ToString();
        var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss'Z'", CultureInfo.InvariantCulture);

        string[]? methodTypes = null;
        var configured = (_settings.PaymentMethodTypes ?? "")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(s => s.ToUpperInvariant())
            .Where(s => s.Length > 0)
            .ToArray();
        if (configured.Length > 0) methodTypes = configured;

        var phone = DokuPhone.NormalizeForDoku(customer.Phone);
        var payloadObj = new Dictionary<string, object>
        {
            ["order"] = new Dictionary<string, object?>
            {
                ["amount"] = amountIdr,
                ["invoice_number"] = invoiceNumber,
                ["currency"] = "IDR",
                ["callback_url"] = callbackUrl,
                ["callback_url_result"] = callbackUrl,
                ["auto_redirect"] = true,
                ["line_items"] = new[]
                {
                    new Dictionary<string, object>
                    {
                        ["id"] = invoiceNumber,
                        ["name"] = description.Length > 255 ? description[..255] : description,
                        ["quantity"] = 1,
                        ["price"] = amountIdr,
                    },
                },
            },
            ["payment"] = methodTypes is null
                ? new Dictionary<string, object> { ["payment_due_date"] = 60 }
                : new Dictionary<string, object>
                {
                    ["payment_due_date"] = 60,
                    ["payment_method_types"] = methodTypes,
                },
            ["customer"] = new Dictionary<string, object?>
            {
                ["id"] = customer.Id.ToString("N").Length > 50
                    ? customer.Id.ToString("N")[..50]
                    : customer.Id.ToString("N"),
                ["name"] = customer.Name.Length > 255 ? customer.Name[..255] : customer.Name,
                ["email"] = (customer.Email ?? "").Length > 128 ? customer.Email![..128] : customer.Email ?? "",
                ["phone"] = phone is { Length: > 0 } p ? p[..Math.Min(16, p.Length)] : null!,
            },
            ["additional_info"] = new Dictionary<string, object>
            {
                ["override_notification_url"] = NotificationUrl(),
            },
        };

        if (phone is null)
        {
            ((Dictionary<string, object?>)payloadObj["customer"]).Remove("phone");
        }

        var payload = JsonSerializer.Serialize(payloadObj);
        var signature = Sign(target, requestId, timestamp, payload);

        using var request = new HttpRequestMessage(HttpMethod.Post, ApiBase + target);
        request.Headers.Add("Client-Id", _settings.ClientId.Trim());
        request.Headers.Add("Request-Id", requestId);
        request.Headers.Add("Request-Timestamp", timestamp);
        request.Headers.Add("Signature", signature);
        request.Content = new StringContent(payload, Encoding.UTF8, "application/json");
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        HttpResponseMessage response;
        try
        {
            response = await http.SendAsync(request, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "DOKU checkout transport failed requestId={RequestId}", requestId);
            throw new InvalidOperationException("Gagal menghubungi DOKU. Coba lagi.", ex);
        }

        var body = await response.Content.ReadAsStringAsync(ct);
        using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(body) ? "{}" : body);
        var root = doc.RootElement;
        string? checkoutUrl = null;
        if (root.TryGetProperty("response", out var resp) &&
            resp.TryGetProperty("payment", out var pay) &&
            pay.TryGetProperty("url", out var urlEl))
        {
            checkoutUrl = urlEl.GetString();
        }

        if (!response.IsSuccessStatusCode || string.IsNullOrWhiteSpace(checkoutUrl))
        {
            logger.LogError(
                "DOKU checkout rejected status={Status} requestId={RequestId} body={Body}",
                (int)response.StatusCode,
                requestId,
                body.Length > 800 ? body[..800] : body);
            throw new InvalidOperationException("DOKU menolak checkout. Periksa credential & channel Back Office.");
        }

        return (checkoutUrl, requestId);
    }

    public async Task<string?> CheckOrderStatusAsync(string invoiceNumber, CancellationToken ct)
    {
        if (!IsConfigured) return null;
        var target = $"/orders/v1/status/{Uri.EscapeDataString(invoiceNumber)}";
        var requestId = Guid.NewGuid().ToString();
        var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss'Z'", CultureInfo.InvariantCulture);
        var signature = Sign(target, requestId, timestamp, body: null);

        using var request = new HttpRequestMessage(HttpMethod.Get, ApiBase + target);
        request.Headers.Add("Client-Id", _settings.ClientId.Trim());
        request.Headers.Add("Request-Id", requestId);
        request.Headers.Add("Request-Timestamp", timestamp);
        request.Headers.Add("Signature", signature);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        try
        {
            var response = await http.SendAsync(request, ct);
            var body = await response.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(body) ? "{}" : body);
            if (doc.RootElement.TryGetProperty("transaction", out var tx) &&
                tx.TryGetProperty("status", out var st))
            {
                return st.GetString();
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "DOKU check-status failed invoice={Invoice}", invoiceNumber);
        }

        return null;
    }

    public bool VerifyNotificationSignature(
        string rawBody,
        string? receivedSignature,
        string requestId,
        string requestTimestamp,
        string requestTarget)
    {
        if (string.IsNullOrWhiteSpace(receivedSignature) ||
            string.IsNullOrWhiteSpace(requestId) ||
            string.IsNullOrWhiteSpace(requestTimestamp))
        {
            return _settings.UseSandboxMock;
        }

        if (!IsConfigured) return false;

        var expected = Sign(requestTarget, requestId, requestTimestamp, rawBody);
        var a = Encoding.UTF8.GetBytes(receivedSignature);
        var b = Encoding.UTF8.GetBytes(expected);
        return a.Length == b.Length && CryptographicOperations.FixedTimeEquals(a, b);
    }

    private string Sign(string target, string requestId, string timestamp, string? body)
    {
        var lines = new List<string>
        {
            $"Client-Id:{_settings.ClientId.Trim()}",
            $"Request-Id:{requestId}",
            $"Request-Timestamp:{timestamp}",
            $"Request-Target:{target}",
        };
        if (body is not null)
        {
            var digest = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(body)));
            lines.Add($"Digest:{digest}");
        }

        var toSign = string.Join('\n', lines);
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_settings.SecretKey.Trim()));
        var sig = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(toSign)));
        return $"HMACSHA256={sig}";
    }
}

public record DokuCustomer(Guid Id, string Name, string Email, string? Phone);
