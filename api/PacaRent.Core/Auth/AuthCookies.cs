namespace PacaRent.Core.Auth;

/// <summary>
/// Access token is carried in an httpOnly cookie instead of being read from
/// localStorage client-side — localStorage is readable by any injected
/// script (XSS), an httpOnly cookie is not. The SPA and API are different
/// origins in production, so the cookie needs SameSite=None (which requires
/// Secure/HTTPS); locally the Vite dev server proxies /api same-origin, so
/// SameSite=Lax over plain HTTP works there.
/// </summary>
public static class AuthCookies
{
    public const string AccessToken = "pacarent_access";
}
