using System.Net;
using System.Net.Mail;
using CRM.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CRM.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string body, bool isHtml = true)
    {
        var smtpServer = _config["EmailSettings:SmtpServer"] ?? "smtp.example.com";
        var smtpPortString = _config["EmailSettings:SmtpPort"] ?? "587";
        var smtpUser = _config["EmailSettings:SmtpUser"] ?? "user@example.com";
        var smtpPass = _config["EmailSettings:SmtpPass"] ?? "password";
        var fromEmail = _config["EmailSettings:FromEmail"] ?? "no-reply@crm.com";
        var fromName = _config["EmailSettings:FromName"] ?? "Smart CRM";

        if (!int.TryParse(smtpPortString, out int smtpPort))
        {
            smtpPort = 587;
        }

        try
        {
            using var client = new SmtpClient(smtpServer, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUser, smtpPass),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = isHtml
            };
            
            mailMessage.To.Add(to);

            // Log that we're sending (in dev this is useful if credentials are fake)
            _logger.LogInformation($"Sending email to {to}: {subject}");
            
            // If dummy credentials, we just log and skip actual sending to avoid exceptions
            if (smtpServer == "smtp.example.com")
            {
                _logger.LogWarning("Email sending skipped because dummy SMTP settings are configured.");
                return;
            }

            await client.SendMailAsync(mailMessage);
            _logger.LogInformation($"Email successfully sent to {to}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to send email to {to}");
            throw; // Let the caller handle or know it failed
        }
    }
}
