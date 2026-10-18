using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using PacaRent.Core.Options;

namespace PacaRent.Infra.Services;

public record PlatformSettingsDto(bool SkipRegistrationOtp, bool SkipBookingPayment);

public interface IPlatformSettingsService
{
    PlatformSettingsDto GetCurrent();
    Task<PlatformSettingsDto> UpdateAsync(PlatformSettingsDto updated, CancellationToken ct = default);
}

/// <summary>
/// Lets an admin flip PacaRent:SkipRegistrationOtp / SkipBookingPayment at
/// runtime, no redeploy needed. Writes to a small JSON file registered as a
/// config source with reloadOnChange, so IOptionsMonitor&lt;PacaRentSettings&gt;
/// picks it up immediately and it takes precedence over appsettings.json/env
/// vars (those stay as the first-boot default until an admin changes it).
/// Persists across restarts since it's a file on disk, not in-memory state.
/// </summary>
public class PlatformSettingsService(
    IOptionsMonitor<PacaRentSettings> options,
    IConfigurationRoot configuration) : IPlatformSettingsService
{
    private static readonly SemaphoreSlim WriteLock = new(1, 1);
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };

    private string OverridePath =>
        configuration["PacaRent:SettingsOverridePath"] ?? "./data/platform-settings.json";

    public PlatformSettingsDto GetCurrent()
    {
        var current = options.CurrentValue;
        return new PlatformSettingsDto(current.SkipRegistrationOtp, current.SkipBookingPayment);
    }

    public async Task<PlatformSettingsDto> UpdateAsync(PlatformSettingsDto updated, CancellationToken ct = default)
    {
        var path = OverridePath;
        await WriteLock.WaitAsync(ct);
        try
        {
            var dir = Path.GetDirectoryName(path);
            if (!string.IsNullOrEmpty(dir)) Directory.CreateDirectory(dir);

            var payload = new Dictionary<string, object>
            {
                [PacaRentSettings.SectionName] = new Dictionary<string, object>
                {
                    [nameof(PacaRentSettings.SkipRegistrationOtp)] = updated.SkipRegistrationOtp,
                    [nameof(PacaRentSettings.SkipBookingPayment)] = updated.SkipBookingPayment,
                },
            };
            await File.WriteAllTextAsync(path, JsonSerializer.Serialize(payload, JsonOptions), ct);

            // Don't rely on the file-system watcher behind reloadOnChange — it's
            // unreliable on some platforms/filesystems (confirmed: native watcher
            // silently missed changes here, and even DOTNET_USE_POLLING_FILE_WATCHER
            // is a multi-second poll). Reload() re-reads every provider and fires the
            // change token synchronously, so IOptionsMonitor reflects the new value
            // the moment this call returns.
            configuration.Reload();
        }
        finally
        {
            WriteLock.Release();
        }

        return GetCurrent();
    }
}
