using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PacaRent.Core.Options;

namespace PacaRent.Infra.Services;

public interface IEmailService
{
    Task SendAsync(string to, string subject, string body, CancellationToken ct = default);
}

public class EmailService(IOptions<SmtpSettings> options, ILogger<EmailService> logger) : IEmailService
{
    public Task SendAsync(string to, string subject, string body, CancellationToken ct = default)
    {
        var smtp = options.Value;
        if (smtp.UseMock)
        {
            logger.LogInformation("[Email mock] To={To} Subject={Subject} Body={Body}", to, subject, body);
            return Task.CompletedTask;
        }

        // Production: integrate MailKit or similar when SMTP credentials are configured.
        logger.LogWarning("SMTP mock disabled but full SMTP client not configured; email dropped.");
        return Task.CompletedTask;
    }
}
