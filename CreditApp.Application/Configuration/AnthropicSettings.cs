namespace CreditApp.Application.Configuration;

public class AnthropicSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://api.anthropic.com";
    public string AnthropicVersion { get; set; } = "2023-06-01";
    public string Model { get; set; } = "claude-sonnet-4-6";
    public int MaxTokensPerResponse { get; set; } = 1024;
}
