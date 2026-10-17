using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using PacaRent.Core.Options;
using PacaRent.Infra.Services;

namespace PacaRent.Api.Controllers;

[ApiController]
[Route("api/config")]
public class ConfigController(
    IOptions<PacaRentSettings> settings,
    IOptions<DokuSettings> dokuOptions,
    DokuCheckoutClient doku) : ControllerBase
{
    [HttpGet("public")]
    public IActionResult PublicConfig()
    {
        var dokuCfg = dokuOptions.Value;
        return Ok(new
        {
            emergencyHelpUrl = settings.Value.EmergencyHelpUrl,
            emergencyHelpLabel = settings.Value.EmergencyHelpLabel,
            termsSummary = "Sewa pacar, teman kencan, dan teman acara—booking lewat platform (early access, gratis).",
            skipBookingPayment = settings.Value.SkipBookingPayment,
            paymentsEnabled = !settings.Value.SkipBookingPayment,
            paymentUseMock = dokuCfg.UseSandboxMock,
            paymentProvider = "doku",
            dokuConfigured = doku.IsConfigured || dokuCfg.UseSandboxMock,
            membershipEnabled = true,
            membershipUseMock = dokuCfg.UseSandboxMock,
        });
    }
}
