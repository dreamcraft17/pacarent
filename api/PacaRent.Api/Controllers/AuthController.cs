using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using PacaRent.Api.Extensions;
using PacaRent.Core.Auth;
using PacaRent.Core.Options;
using PacaRent.Api.Models;
using PacaRent.Core.Entities;
using PacaRent.Core.Enums;
using PacaRent.Core.Rules;
using PacaRent.Infra.Data;
using PacaRent.Infra.Services;

namespace PacaRent.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    PacaRentDbContext db,
    IOtpService otp,
    ITokenService tokens,
    IAuditService audit,
    IOptions<JwtSettings> jwtOptions,
    IOptionsMonitor<PacaRentSettings> pacaRentOptions,
    IWebHostEnvironment env) : ControllerBase
{
    private void SetAccessCookie(string token, DateTimeOffset expires)
    {
        Response.Cookies.Append(AuthCookies.AccessToken, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = !env.IsDevelopment(),
            // Cross-origin in production (SPA and API are different domains) needs
            // SameSite=None; the Vite dev proxy makes it same-origin locally, where
            // None without Secure would be rejected by the browser, so use Lax there.
            SameSite = env.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None,
            Expires = expires,
            Path = "/",
        });
    }

    private void ClearAccessCookie()
    {
        Response.Cookies.Delete(AuthCookies.AccessToken, new CookieOptions { Path = "/" });
    }

    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Register([FromBody] AuthRegisterRequest req, CancellationToken ct)
    {
        if (!req.TermsAccepted)
        {
            return BadRequest(new ApiError("terms_required", "Anda harus menyetujui Syarat & Ketentuan."));
        }

        if (string.IsNullOrWhiteSpace(req.Email) && string.IsNullOrWhiteSpace(req.Phone))
        {
            return BadRequest(new ApiError("contact_required", "Email atau nomor HP wajib diisi."));
        }

        if (!BusinessRules.IsAdult(req.BirthDate))
        {
            return BadRequest(new ApiError("underage", "Usia minimal 18 tahun."));
        }

        if (!BusinessRules.IsValidPassword(req.Password))
        {
            return BadRequest(new ApiError("password_too_short", $"Password minimal {BusinessRules.MinPasswordLength} karakter."));
        }

        var normalizedEmail = string.IsNullOrWhiteSpace(req.Email) ? null : req.Email.Trim().ToLowerInvariant();
        var normalizedPhone = string.IsNullOrWhiteSpace(req.Phone) ? null : req.Phone.Trim();

        var destination = (normalizedEmail ?? normalizedPhone)!;
        if (await db.Users.AnyAsync(u =>
                (normalizedEmail != null && u.Email == normalizedEmail) ||
                (normalizedPhone != null && u.Phone == normalizedPhone), ct))
        {
            return Conflict(new ApiError("exists", "Akun sudah terdaftar."));
        }

        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = normalizedEmail,
            Phone = normalizedPhone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Role = UserRole.User,
            TermsAccepted = true,
            TermsAcceptedAt = DateTime.UtcNow,
            Profile = new UserProfile
            {
                UserId = userId,
                FullName = req.FullName.Trim(),
                BirthDate = req.BirthDate,
                Gender = req.Gender,
                City = req.City.Trim()
            }
        };
        db.Users.Add(user);
        await db.SaveChangesAsync(ct);
        await audit.LogAsync(userId, "register", "user", userId.ToString(), null, ct);

        if (pacaRentOptions.CurrentValue.SkipRegistrationOtp)
        {
            var tokenResponse = await IssueTokensAsync(user, ct);
            await audit.LogAsync(userId, "login", "user", userId.ToString(), null, ct);
            return Ok(tokenResponse);
        }

        await otp.IssueAsync(destination, ct);
        return Ok(new { message = "Registrasi berhasil. Verifikasi OTP.", destination, requiresOtp = true });
    }

    [HttpPost("verify-otp")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> VerifyOtp([FromBody] AuthVerifyOtpRequest req, CancellationToken ct)
    {
        if (!await otp.VerifyAsync(req.Destination, req.Code, ct))
        {
            return BadRequest(new ApiError("otp_invalid", "OTP tidak valid atau kedaluwarsa."));
        }

        return Ok(new { verified = true });
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login([FromBody] AuthLoginRequest req, CancellationToken ct)
    {
        var login = req.Login.Trim().ToLowerInvariant();
        var user = await db.Users.Include(u => u.Profile)
            .FirstOrDefaultAsync(u => u.Email == login || u.Phone == login, ct);
        if (user is null)
        {
            return Unauthorized(new ApiError("invalid_credentials", "Login gagal."));
        }

        if (user.Status == UserStatus.Blocked)
        {
            return StatusCode(403, new ApiError("blocked", "Akun diblokir."));
        }

        if (user.LoginLockedUntil is not null && user.LoginLockedUntil > DateTime.UtcNow)
        {
            return StatusCode(429, new ApiError("locked", "Akun terkunci sementara."));
        }

        if (!BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
        {
            user.FailedLoginAttempts++;
            if (user.FailedLoginAttempts >= BusinessRules.MaxFailedLogins)
            {
                user.LoginLockedUntil = DateTime.UtcNow.AddMinutes(BusinessRules.LoginLockMinutes);
                user.FailedLoginAttempts = 0;
            }

            await db.SaveChangesAsync(ct);
            return Unauthorized(new ApiError("invalid_credentials", "Login gagal."));
        }

        user.FailedLoginAttempts = 0;
        user.LoginLockedUntil = null;
        await db.SaveChangesAsync(ct);

        var tokenResponse = await IssueTokensAsync(user, ct);
        await audit.LogAsync(user.Id, "login", "user", user.Id.ToString(), null, ct);
        return Ok(tokenResponse);
    }

    private async Task<TokenResponse> IssueTokensAsync(User user, CancellationToken ct)
    {
        var (access, expires) = tokens.CreateAccessToken(user);
        var refreshPlain = tokens.GenerateRefreshTokenPlain();
        db.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = tokens.HashToken(refreshPlain),
            ExpiresAt = DateTime.UtcNow.AddDays(jwtOptions.Value.RefreshTokenDays)
        });
        await db.SaveChangesAsync(ct);
        SetAccessCookie(access, expires);
        return new TokenResponse(access, expires, refreshPlain, user.Id, user.Role.ToString());
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] AuthRefreshRequest req, CancellationToken ct)
    {
        var hash = tokens.HashToken(req.RefreshToken);
        var stored = await db.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.TokenHash == hash && r.RevokedAt == null && r.ExpiresAt > DateTime.UtcNow, ct);
        if (stored is null)
        {
            return Unauthorized(new ApiError("invalid_refresh", "Refresh token tidak valid."));
        }

        var (access, expires) = tokens.CreateAccessToken(stored.User);
        SetAccessCookie(access, expires);
        return Ok(new TokenResponse(access, expires, req.RefreshToken, stored.UserId, stored.User.Role.ToString()));
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        ClearAccessCookie();
        return Ok(new { loggedOut = true });
    }

    [HttpGet("me")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        if (userId is null) return Unauthorized();
        var user = await db.Users.AsNoTracking()
            .Include(u => u.Profile)
            .FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user is null)
        {
            return NotFound();
        }

        AuthMeProfileDto? profile = user.Profile is null
            ? null
            : new AuthMeProfileDto(
                user.Profile.FullName,
                user.Profile.City,
                user.Profile.PhotoUrl,
                user.Profile.EmergencyContactName,
                user.Profile.EmergencyContactPhone);

        return Ok(new AuthMeResponse(user.Id, user.Email, user.Phone, user.Role.ToString(), profile));
    }
}
