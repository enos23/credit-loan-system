namespace CreditApp.Application.Configuration;

public class EmailSettings
{
    // SMTP target. Defaults work with a local MailHog container
    // (docker run -p 1025:25 -p 8025:8025 mailhog/mailhog).
    public string SmtpHost { get; set; } = "localhost";
    public int SmtpPort { get; set; } = 1025;
    public string SmtpUsername { get; set; } = string.Empty;
    public string SmtpPassword { get; set; } = string.Empty;

    // For Resend in production: STARTTLS on port 587.
    public bool UseStartTls { get; set; } = false;

    // Visible sender info.
    public string FromEmail { get; set; } = "noreply@creditwise.local";
    public string FromName { get; set; } = "CreditWise";

    // Used to build absolute links inside email bodies (reset password page, etc.).
    public string FrontendBaseUrl { get; set; } = "http://localhost:5173";

    // When false, the SmtpEmailService logs the message and returns immediately
    // without contacting any SMTP server. Useful for tests or when the smtp host
    // is intentionally unset.
    public bool Enabled { get; set; } = true;
}
