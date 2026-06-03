namespace CreditApp.Application.Email;

public class EmailMessage
{
    public string ToEmail { get; set; } = string.Empty;
    public string ToName { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;

    // Always provide both. Receivers that don't render HTML (rare) fall back to the
    // plain text part; spam filters score lower when both are present.
    public string HtmlBody { get; set; } = string.Empty;
    public string PlainTextBody { get; set; } = string.Empty;
}
