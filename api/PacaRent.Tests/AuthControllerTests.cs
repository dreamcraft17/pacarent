using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using PacaRent.Api.Controllers;
using PacaRent.Api.Models;
using PacaRent.Core.Enums;
using PacaRent.Core.Options;
using PacaRent.Infra.Data;
using PacaRent.Infra.Services;

namespace PacaRent.Tests;

/// <summary>
/// Early access defaults (SkipRegistrationOtp/SkipBookingPayment = true, see
/// PacaRentSettings) mean registration must issue tokens immediately with no
/// OTP or payment step — these tests exercise exactly that path, not the
/// (currently unused) OTP flow.
/// </summary>
public class AuthControllerTests
{
    private static AuthController BuildController(PacaRentDbContext db)
    {
        return new AuthController(
            db,
            new NoOpOtpService(),
            new TokenService(Options.Create(new JwtSettings())),
            new AuditService(db),
            Options.Create(new JwtSettings()),
            new StaticOptionsMonitor<PacaRentSettings>(new PacaRentSettings()),
            new FakeWebHostEnvironment())
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext(),
            },
        };
    }

    private static PacaRentDbContext NewDb() =>
        new(new DbContextOptionsBuilder<PacaRentDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    private static AuthRegisterRequest ValidRequest(Gender? gender = null) => new(
        Email: "newuser@example.com",
        Phone: null,
        Password: "password123",
        FullName: "Pengguna Baru",
        BirthDate: new DateOnly(2000, 1, 1),
        City: "Jakarta Selatan",
        TermsAccepted: true,
        Gender: gender);

    [Fact]
    public async Task Register_rejects_underage()
    {
        await using var db = NewDb();
        var controller = BuildController(db);
        var req = ValidRequest() with { BirthDate = DateOnly.FromDateTime(DateTime.UtcNow).AddYears(-17) };

        var result = await controller.Register(req, CancellationToken.None);

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        var error = Assert.IsType<ApiError>(bad.Value);
        Assert.Equal("underage", error.Code);
    }

    [Fact]
    public async Task Register_rejects_short_password()
    {
        await using var db = NewDb();
        var controller = BuildController(db);
        var req = ValidRequest() with { Password = "short" };

        var result = await controller.Register(req, CancellationToken.None);

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        var error = Assert.IsType<ApiError>(bad.Value);
        Assert.Equal("password_too_short", error.Code);
    }

    [Fact]
    public async Task Register_rejects_missing_terms_acceptance()
    {
        await using var db = NewDb();
        var controller = BuildController(db);
        var req = ValidRequest() with { TermsAccepted = false };

        var result = await controller.Register(req, CancellationToken.None);

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        var error = Assert.IsType<ApiError>(bad.Value);
        Assert.Equal("terms_required", error.Code);
    }

    [Fact]
    public async Task Register_rejects_duplicate_email()
    {
        await using var db = NewDb();
        var controller = BuildController(db);
        await controller.Register(ValidRequest(), CancellationToken.None);

        var result = await controller.Register(ValidRequest(), CancellationToken.None);

        var conflict = Assert.IsType<ConflictObjectResult>(result);
        var error = Assert.IsType<ApiError>(conflict.Value);
        Assert.Equal("exists", error.Code);
    }

    [Fact]
    public async Task Register_issues_tokens_immediately_without_otp_or_payment()
    {
        await using var db = NewDb();
        var controller = BuildController(db);

        var result = await controller.Register(ValidRequest(), CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        var token = Assert.IsType<TokenResponse>(ok.Value);
        Assert.False(string.IsNullOrWhiteSpace(token.AccessToken));
        Assert.False(string.IsNullOrWhiteSpace(token.RefreshToken));

        var saved = await db.Users.FindAsync(token.UserId);
        Assert.NotNull(saved);
        Assert.Equal(UserStatus.Active, saved!.Status);
    }

    [Theory]
    [InlineData(Gender.Male)]
    [InlineData(Gender.Female)]
    [InlineData(Gender.Undisclosed)]
    [InlineData(null)]
    public async Task Register_stores_optional_gender(Gender? gender)
    {
        await using var db = NewDb();
        var controller = BuildController(db);

        var result = await controller.Register(ValidRequest(gender), CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        var token = Assert.IsType<TokenResponse>(ok.Value);
        var profile = await db.UserProfiles.FindAsync(token.UserId);
        Assert.Equal(gender, profile!.Gender);
    }

    private sealed class NoOpOtpService : IOtpService
    {
        public Task<string> IssueAsync(string destination, CancellationToken ct = default) =>
            throw new InvalidOperationException("OTP should not be used while SkipRegistrationOtp is enabled.");

        public Task<bool> VerifyAsync(string destination, string code, CancellationToken ct = default) =>
            throw new InvalidOperationException("OTP should not be used while SkipRegistrationOtp is enabled.");
    }

    private sealed class StaticOptionsMonitor<T>(T value) : IOptionsMonitor<T>
    {
        public T CurrentValue { get; } = value;
        public T Get(string? name) => CurrentValue;
        public IDisposable? OnChange(Action<T, string?> listener) => null;
    }

    private sealed class FakeWebHostEnvironment : IWebHostEnvironment
    {
        public string EnvironmentName { get; set; } = "Development";
        public string ApplicationName { get; set; } = "PacaRent.Tests";
        public string WebRootPath { get; set; } = "";
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
        public string ContentRootPath { get; set; } = AppContext.BaseDirectory;
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}
