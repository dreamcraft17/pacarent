using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PacaRent.Core.Options;

namespace PacaRent.Infra.Services;

public record PaymentCheckoutResult(string GatewayRef, string CheckoutUrl, decimal Amount, string InvoiceNumber);

public interface IPaymentGatewayService
{
    Task<PaymentCheckoutResult> CreateCheckoutAsync(
        Guid bookingId,
        decimal amount,
        DokuCustomer customer,
        string callbackUrl,
        CancellationToken ct = default);

    bool ValidateNotificationSignature(
        string payload,
        string? signatureHeader,
        string requestId,
        string requestTimestamp,
        string requestTarget);

    string? ParseBookingIdFromNotification(string payload);
    string? ParseTransactionStatusFromNotification(string payload);

    Task<string?> QueryOrderStatusAsync(string invoiceNumber, CancellationToken ct = default);
}

public class DokuPaymentGatewayService(
    DokuCheckoutClient doku,
    IOptions<DokuSettings> dokuOptions,
    ILogger<DokuPaymentGatewayService> logger) : IPaymentGatewayService
{
    public async Task<PaymentCheckoutResult> CreateCheckoutAsync(
        Guid bookingId,
        decimal amount,
        DokuCustomer customer,
        string callbackUrl,
        CancellationToken ct = default)
    {
        var settings = dokuOptions.Value;
        var invoice = DokuInvoice.ForBooking(bookingId);
        var amountIdr = (long)decimal.Truncate(amount);
        if (amountIdr < 1) amountIdr = 1;

        if (settings.UseSandboxMock)
        {
            var gatewayRef = $"DOKU-MOCK-{bookingId:N}";
            var url = $"/bayar/{bookingId}?ref={gatewayRef}";
            logger.LogInformation("DOKU mock checkout booking={BookingId} amount={Amount}", bookingId, amountIdr);
            return new PaymentCheckoutResult(gatewayRef, url, amount, invoice);
        }

        if (!doku.IsConfigured)
        {
            throw new InvalidOperationException(
                "DOKU live diminta tetapi ClientId/SecretKey kosong. Isi env atau set Doku__UseSandboxMock=true.");
        }

        var description = $"PacaRent booking {invoice}";
        var (checkoutUrl, requestId) = await doku.CreateCheckoutAsync(
            invoice,
            amountIdr,
            description,
            customer,
            callbackUrl,
            ct);

        return new PaymentCheckoutResult(requestId, checkoutUrl, amount, invoice);
    }

    public bool ValidateNotificationSignature(
        string payload,
        string? signatureHeader,
        string requestId,
        string requestTimestamp,
        string requestTarget) =>
        doku.VerifyNotificationSignature(payload, signatureHeader, requestId, requestTimestamp, requestTarget);

    public string? ParseBookingIdFromNotification(string payload)
    {
        try
        {
            using var doc = JsonDocument.Parse(payload);
            if (doc.RootElement.TryGetProperty("order", out var order) &&
                order.TryGetProperty("invoice_number", out var inv))
            {
                var invoice = inv.GetString();
                if (invoice is not null && DokuInvoice.TryParseBookingId(invoice, out var bookingId))
                {
                    return bookingId.ToString();
                }
            }

            if (doc.RootElement.TryGetProperty("bookingId", out var legacy))
            {
                return legacy.GetString();
            }
        }
        catch (JsonException)
        {
            // ignore
        }

        return null;
    }

    public string? ParseTransactionStatusFromNotification(string payload)
    {
        try
        {
            using var doc = JsonDocument.Parse(payload);
            if (doc.RootElement.TryGetProperty("transaction", out var tx) &&
                tx.TryGetProperty("status", out var st))
            {
                return st.GetString();
            }

            if (doc.RootElement.TryGetProperty("status", out var legacy))
            {
                return legacy.GetString();
            }
        }
        catch (JsonException)
        {
            // ignore
        }

        return null;
    }

    public Task<string?> QueryOrderStatusAsync(string invoiceNumber, CancellationToken ct = default) =>
        doku.CheckOrderStatusAsync(invoiceNumber, ct);
}
