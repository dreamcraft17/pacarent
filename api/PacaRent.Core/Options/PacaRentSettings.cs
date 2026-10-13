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

    public bool UseSandboxMock { get; set; } = true;
    public string ClientId { get; set; } = "";
    public string SecretKey { get; set; } = "";
    public string WebhookSecret { get; set; } = "";
    public string BaseUrl { get; set; } = "https://api.doku.com";
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
