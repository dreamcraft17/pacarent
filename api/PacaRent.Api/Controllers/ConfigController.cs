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
            termsSummary = "Pendamping untuk event, dinner, dan nongkrong—request dan chat lewat platform (early access).",
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
