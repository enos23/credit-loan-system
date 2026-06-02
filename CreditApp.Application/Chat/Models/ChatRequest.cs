using System.Text.Json.Serialization;

namespace CreditApp.Application.Chat.Models;

public class ChatRequest
{
    [JsonPropertyName("model")]
    public string Model { get; set; } = string.Empty;

    [JsonPropertyName("max_tokens")]
    public int MaxTokens { get; set; }

    // System prompt as a list of blocks lets us mark the prompt for caching
    // (cache_control on the first block caches up to that point).
    [JsonPropertyName("system")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public List<ChatContentBlock>? System { get; set; }

    [JsonPropertyName("tools")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public List<ChatTool>? Tools { get; set; }

    [JsonPropertyName("messages")]
    public List<ChatMessage> Messages { get; set; } = new();
}
