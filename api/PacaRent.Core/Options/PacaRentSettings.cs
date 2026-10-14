namespace PacaRent.Core.Options;

public class PacaRentSettings
{
    public const string SectionName = "PacaRent";

    public decimal PlatformFeePercent { get; set; } = 15m;
    public string DocumentStoragePath { get; set; } = "./data/documents";
    public string DocumentEncryptionKey { get; set; } = "";
    public string EmergencyHelpUrl { get; set; } = "tel:112";
    public string EmergencyHelpLabel { get; set; } = "Hubungi 112 (Darurat)";

    /// <summary>Lewati OTP setelah daftar (testing/MVP). Matikan saat SMS/email OTP siap.</summary>
    public bool SkipRegistrationOtp { get; set; } = true;

    /// <summary>Rilis awal: tidak wajib bayar via DOKU; setelah mitra terima → langsung siap jalan.</summary>
    public bool SkipBookingPayment { get; set; } = true;
}

public class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Secret { get; set; } = "";
    public string Issuer { get; set; } = "pacarent";
    public string Audience { get; set; } = "pacarent-web";
    public int AccessTokenMinutes { get; set; } = 15;
    public int RefreshTokenDays { get; set; } = 7;
}

public class DokuSettings
{
    public const string SectionName = "Doku";

    /// <summary>Dev-only: mock checkout + webhook tanpa call DOKU.</summary>
    public bool UseSandboxMock { get; set; } = true;

    /// <summary>Sama seperti DOKU_IS_PRODUCTION di dnPeople.</summary>
    public bool IsProduction { get; set; }

    public string ClientId { get; set; } = "";
    public string SecretKey { get; set; } = "";
    public string WebhookSecret { get; set; } = "";

    /// <summary>Public API base (tanpa trailing slash), untuk default webhook URL.</summary>
    public string ApiPublicUrl { get; set; } = "";

    /// <summary>Override penuh — e.g. https://api.pacarent.dntech.id/api/payments/webhook/doku</summary>
    public string? NotificationUrl { get; set; }

    /// <summary>Redirect setelah bayar di halaman DOKU — e.g. https://pacarent.vercel.app/bookings</summary>
    public string WebCallbackUrl { get; set; } = "http://localhost:5173/bookings";

    /// <summary>Optional — kosong = channel aktif di DOKU Back Office (recommended).</summary>
    public string? PaymentMethodTypes { get; set; }
}

public class SmtpSettings
{
    public const string SectionName = "Smtp";

    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 25;
    public string From { get; set; } = "noreply@pacarent.local";
    public string? User { get; set; }
    public string? Password { get; set; }
    public bool UseMock { get; set; } = true;
}
