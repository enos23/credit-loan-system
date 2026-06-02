using System.Text.Json;
using System.Text.Json.Serialization;

namespace CreditApp.Application.Chat.Models;

// A single content block in a message. The Anthropic API uses a discriminator
// pattern (the "type" field) to switch between text, tool_use, and tool_result.
// We model this as a flat type with optional fields; consumers read Type and
// dispatch accordingly.
public class ChatContentBlock
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = "text"; // "text" | "tool_use" | "tool_result"

    // Used when Type == "text"
    [JsonPropertyName("text")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Text { get; set; }

    // Used when Type == "tool_use" — model is requesting a tool call
    [JsonPropertyName("id")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Id { get; set; }

    [JsonPropertyName("name")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Name { get; set; }

    [JsonPropertyName("input")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public JsonElement? Input { get; set; }

    // Used when Type == "tool_result" — we're sending the tool execution result back
    [JsonPropertyName("tool_use_id")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? ToolUseId { get; set; }

    // Tool result content — Anthropic accepts a string here for simplicity.
    [JsonPropertyName("content")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Content { get; set; }

    [JsonPropertyName("is_error")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public bool? IsError { get; set; }

    // Prompt-caching marker. Setting this on system / tool blocks makes Anthropic
    // cache the prefix for 5 min, cutting repeat-cost dramatically.
    [JsonPropertyName("cache_control")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public CacheControl? CacheControl { get; set; }

    public static ChatContentBlock TextBlock(string text) =>
        new() { Type = "text", Text = text };

    public static ChatContentBlock ToolResultBlock(string toolUseId, string content, bool isError = false) =>
        new() { Type = "tool_result", ToolUseId = toolUseId, Content = content, IsError = isError ? true : null };
}

public class CacheControl
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = "ephemeral";
}
