using CreditApp.Application.Configuration;
using CreditApp.Application.Email;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;

namespace CreditApp.Infrastructure.Email;

public class SmtpEmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IOptions<EmailSettings> settings, ILogger<SmtpEmailService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public void Enqueue(EmailMessage message)
    {
        if (!_settings.Enabled)
        {
            _logger.LogDebug("Email disabled by config — dropping message to {To}, subject '{Subject}'",
                message.ToEmail, message.Subject);
            return;
        }

        // Fire-and-forget. We intentionally don't await — callers should never block
        // on SMTP. Failures are logged, never propagated.
        _ = Task.Run(async () =>
        {
            try
            {
                await SendAsync(message);
                _logger.LogInformation("Email sent to {To}, subject '{Subject}'",
                    message.ToEmail, message.Subject);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {To}, subject '{Subject}'",
                    message.ToEmail, message.Subject);
            }
        });
    }

    private async Task SendAsync(EmailMessage message)
    {
        var mime = new MimeMessage();
        mime.From.Add(new MailboxAddress(_settings.FromName, _settings.FromEmail));
        mime.To.Add(new MailboxAddress(message.ToName, message.ToEmail));
        mime.Subject = message.Subject;

        var builder = new BodyBuilder
        {
            HtmlBody = message.HtmlBody,
            TextBody = message.PlainTextBody,
        };
        mime.Body = builder.ToMessageBody();

        using var client = new SmtpClient();
        var socketOptions = _settings.UseStartTls
            ? SecureSocketOptions.StartTls
            : SecureSocketOptions.None;
        await client.ConnectAsync(_settings.SmtpHost, _settings.SmtpPort, socketOptions);

        if (!string.IsNullOrEmpty(_settings.SmtpUsername))
            await client.AuthenticateAsync(_settings.SmtpUsername, _settings.SmtpPassword);

        await client.SendAsync(mime);
        await client.DisconnectAsync(true);
    }
}
