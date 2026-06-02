using System.Text.Json.Serialization;

namespace CreditApp.Application.Chat.Models;

public class ChatResponse
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("model")]
    public string Model { get; set; } = string.Empty;

    [JsonPropertyName("role")]
    public string Role { get; set; } = "assistant";

    [JsonPropertyName("content")]
    public List<ChatContentBlock> Content { get; set; } = new();

    // "end_turn" — model finished naturally
    // "tool_use" — model wants to call a tool; we run it and feed back
    // "max_tokens" — we hit the cap
    // "stop_sequence" — model hit a configured stop string (we don't use these)
    [JsonPropertyName("stop_reason")]
    public string? StopReason { get; set; }

    [JsonPropertyName("usage")]
    public ChatUsage Usage { get; set; } = new();
}
