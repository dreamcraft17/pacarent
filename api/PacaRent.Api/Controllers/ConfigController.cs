using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using PacaRent.Core.Options;
using PacaRent.Infra.Services;

namespace PacaRent.Api.Controllers;

[ApiController]
[Route("api/config")]
public class ConfigController(
    IOptionsMonitor<PacaRentSettings> settings,
    IOptions<DokuSettings> dokuOptions,
    DokuCheckoutClient doku) : ControllerBase
{
    [HttpGet("public")]
    public IActionResult PublicConfig()
    {
        var dokuCfg = dokuOptions.Value;
        return Ok(new
        {
            emergencyHelpUrl = settings.CurrentValue.EmergencyHelpUrl,
            emergencyHelpLabel = settings.CurrentValue.EmergencyHelpLabel,
            termsSummary = "Sewa pacar, teman kencan, dan teman acara—booking lewat platform (early access, gratis).",
            skipBookingPayment = settings.CurrentValue.SkipBookingPayment,
            paymentsEnabled = !settings.CurrentValue.SkipBookingPayment,
            paymentUseMock = dokuCfg.UseSandboxMock,
            paymentProvider = "doku",
            dokuConfigured = doku.IsConfigured || dokuCfg.UseSandboxMock,
            membershipEnabled = true,
            membershipUseMock = dokuCfg.UseSandboxMock,
        });
    }
}
