using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using CreditApp.Application.Configuration;
using CreditApp.Application.Email;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CreditApp.Infrastructure.Email;

// Drop-in alternative to SmtpEmailService for cloud hosts that block outbound
// SMTP. Talks to Resend's HTTPS REST endpoint at api.resend.com/emails — same
// pricing/limits as their SMTP relay, just a different transport.
public class ResendEmailService : IEmailService
{
    private const string EndpointUrl = "https://api.resend.com/emails";

    private readonly HttpClient _httpClient;
    private readonly EmailSettings _settings;
    private readonly ILogger<ResendEmailService> _logger;

    public ResendEmailService(
        HttpClient httpClient,
        IOptions<EmailSettings> settings,
        ILogger<ResendEmailService> logger)
    {
        _httpClient = httpClient;
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

        // Fire-and-forget. Failures are logged, never propagated.
        _ = Task.Run(async () =>
        {
            try
            {
                await SendAsync(message);
                _logger.LogInformation("Email sent via Resend API to {To}, subject '{Subject}'",
                    message.ToEmail, message.Subject);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email via Resend API to {To}, subject '{Subject}'",
                    message.ToEmail, message.Subject);
            }
        });
    }

    private async Task SendAsync(EmailMessage message)
    {
        var payload = new ResendPayload
        {
            From = string.IsNullOrEmpty(_settings.FromName)
                ? _settings.FromEmail
                : $"{_settings.FromName} <{_settings.FromEmail}>",
            To = new[] { message.ToEmail },
            Subject = message.Subject,
            Html = message.HtmlBody,
            Text = message.PlainTextBody,
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, EndpointUrl)
        {
            Content = JsonContent.Create(payload),
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _settings.ResendApiKey);

        using var response = await _httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException(
                $"Resend API returned HTTP {(int)response.StatusCode}: {body}");
        }
    }

    // Mirrors Resend's expected JSON payload shape — snake_case via attributes.
    private class ResendPayload
    {
        [JsonPropertyName("from")] public string From { get; set; } = string.Empty;
        [JsonPropertyName("to")] public string[] To { get; set; } = Array.Empty<string>();
        [JsonPropertyName("subject")] public string Subject { get; set; } = string.Empty;
        [JsonPropertyName("html")] public string Html { get; set; } = string.Empty;
        [JsonPropertyName("text")] public string Text { get; set; } = string.Empty;
    }
}
