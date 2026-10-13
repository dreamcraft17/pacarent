using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PacaRent.Infra.Data;

namespace PacaRent.Api.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController(PacaRentDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        await DataSeeder.EnsureDefaultCategoriesAsync(db, ct);
        await DemoDataSeeder.EnsureDemoPartnerCategoriesAsync(db, ct);
        var items = await db.Categories.AsNoTracking().Where(c => c.IsActive).ToListAsync(ct);
        var ordered = items
            .OrderBy(c => c.Name.Equals("Sewa pacar", StringComparison.OrdinalIgnoreCase) ? 0 : 1)
            .ThenBy(c => c.Name, StringComparer.OrdinalIgnoreCase)
            .ToList();
        return Ok(ordered.Select(c => new { c.Id, c.Name, c.IsActive }));
    }
}
