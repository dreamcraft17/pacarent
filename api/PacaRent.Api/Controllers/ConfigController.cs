using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using PacaRent.Core.Options;

namespace PacaRent.Api.Controllers;

[ApiController]
[Route("api/config")]
public class ConfigController(IOptions<PacaRentSettings> settings) : ControllerBase
{
    [HttpGet("public")]
    public IActionResult PublicConfig() => Ok(new
    {
        emergencyHelpUrl = settings.Value.EmergencyHelpUrl,
        emergencyHelpLabel = settings.Value.EmergencyHelpLabel,
        termsSummary = "Sewa pacar, teman kencan, dan teman acara—booking aman dengan mitra terverifikasi."
    });
}
