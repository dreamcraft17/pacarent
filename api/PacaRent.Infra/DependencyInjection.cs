using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PacaRent.Core.Options;
using PacaRent.Infra.Data;
using PacaRent.Infra.Services;

namespace PacaRent.Infra;

public static class DependencyInjection
{
    public static IServiceCollection AddPacaRentInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<PacaRentSettings>(configuration.GetSection(PacaRentSettings.SectionName));
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
        services.Configure<DokuSettings>(configuration.GetSection(DokuSettings.SectionName));
        services.Configure<SmtpSettings>(configuration.GetSection(SmtpSettings.SectionName));

        var useInMemory = configuration.GetValue<bool>("Database:UseInMemory");
        services.AddDbContext<PacaRentDbContext>(options =>
        {
            if (useInMemory)
            {
                options.UseInMemoryDatabase("pacarent-demo");
            }
            else
            {
                var conn = configuration.GetConnectionString("DefaultConnection")
                           ?? "Host=localhost;Port=5432;Database=pacarent;Username=pacarent;Password=pacarent";
                options.UseNpgsql(conn);
            }
        });

        services.AddScoped<IAuditService, AuditService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IDocumentStorageService, DocumentStorageService>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IOtpService, OtpService>();
        services.AddSingleton<IPlatformSettingsService, PlatformSettingsService>();
        services.AddHttpClient<DokuCheckoutClient>();
        services.AddScoped<IPaymentGatewayService, DokuPaymentGatewayService>();

        return services;
    }
}
