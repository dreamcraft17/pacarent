using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PacaRent.Api.Background;
using PacaRent.Core.Options;
using PacaRent.Infra;
using PacaRent.Infra.Data;

var builder = WebApplication.CreateBuilder(args);

// Admin-managed runtime toggles (PacaRent:SkipRegistrationOtp / SkipBookingPayment) —
// written by PlatformSettingsService, reloaded live, and takes precedence over
// appsettings.json/env vars so an admin can flip them without a redeploy.
var settingsOverridePath = builder.Configuration["PacaRent:SettingsOverridePath"] ?? "./data/platform-settings.json";
var settingsOverrideFullPath = Path.IsPathRooted(settingsOverridePath)
    ? settingsOverridePath
    : Path.Combine(builder.Environment.ContentRootPath, settingsOverridePath);
// The file must exist before the config source is built, or the file-system
// watcher behind reloadOnChange can miss the file's first creation on some
// platforms and never reload after that.
Directory.CreateDirectory(Path.GetDirectoryName(settingsOverrideFullPath)!);
if (!File.Exists(settingsOverrideFullPath))
{
    File.WriteAllText(settingsOverrideFullPath, "{}");
}
builder.Configuration.AddJsonFile(settingsOverridePath, optional: true, reloadOnChange: true);
// PlatformSettingsService calls Reload() explicitly after writing the override
// file above — IConfigurationRoot isn't registered in DI by default.
builder.Services.AddSingleton<Microsoft.Extensions.Configuration.IConfigurationRoot>(builder.Configuration);

var pacaRentSection = builder.Configuration.GetSection(PacaRentSettings.SectionName).Get<PacaRentSettings>() ?? new PacaRentSettings();
if (builder.Environment.IsProduction() && string.IsNullOrWhiteSpace(pacaRentSection.DocumentEncryptionKey))
{
    throw new InvalidOperationException(
        "PacaRent:DocumentEncryptionKey (PacaRent__DocumentEncryptionKey) must be set in production. " +
        "Refusing to start with the hardcoded dev key — partner verification documents would be " +
        "encrypted with a key anyone reading the source code already knows.");
}

builder.Services.AddPacaRentInfrastructure(builder.Configuration);
builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    o.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "PacaRent API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "JWT Bearer token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddHostedService<PacaRentBackgroundService>();
builder.Services.AddHealthChecks();

var jwt = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>() ?? new JwtSettings();
if (builder.Environment.IsProduction() && string.IsNullOrWhiteSpace(jwt.Secret))
{
    throw new InvalidOperationException(
        "Jwt:Secret (Jwt__Secret) must be set in production. Refusing to start with the hardcoded dev secret.");
}
var secret = string.IsNullOrWhiteSpace(jwt.Secret)
    ? "dev-only-jwt-secret-min-32-characters-long!!"
    : jwt.Secret;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
            RoleClaimType = System.Security.Claims.ClaimTypes.Role
        };
        // Prefer the httpOnly cookie; fall back to an Authorization header for
        // any non-browser client that still wants to send a Bearer token.
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (string.IsNullOrEmpty(context.Token) &&
                    context.Request.Cookies.TryGetValue(PacaRent.Core.Auth.AuthCookies.AccessToken, out var cookieToken))
                {
                    context.Token = cookieToken;
                }
                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("auth", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 20;
        opt.QueueLimit = 0;
    });
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173" };
builder.Services.AddCors(options =>
{
    // AllowCredentials is required for the browser to send/accept the httpOnly
    // auth cookie cross-origin — only valid together with a specific origin
    // allowlist (never AllowAnyOrigin), which is already the case above.
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PacaRentDbContext>();
    var useInMemory = app.Configuration.GetValue<bool>("Database:UseInMemory");
    if (useInMemory)
    {
        await db.Database.EnsureCreatedAsync();
    }
    else
    {
        await db.Database.MigrateAsync();
    }

    await DataSeeder.SeedAsync(db);
    if (useInMemory)
    {
        await DemoDataSeeder.SeedDemoPartnerAsync(db);
    }
}

app.Run();
