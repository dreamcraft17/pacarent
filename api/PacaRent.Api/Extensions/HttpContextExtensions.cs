using System.Security.Claims;

namespace PacaRent.Api.Extensions;

public static class HttpContextExtensions
{
    public static Guid? GetUserId(this HttpContext ctx)
    {
        var sub = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? ctx.User.FindFirstValue(ClaimTypes.Name)
                  ?? ctx.User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var id) ? id : null;
    }
}
