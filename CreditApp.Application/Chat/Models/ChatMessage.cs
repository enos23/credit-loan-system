using System.Text.Json.Serialization;

namespace CreditApp.Application.Chat.Models;

public class ChatMessage
{
    [JsonPropertyName("role")]
    public string Role { get; set; } = "user"; // "user" | "assistant"

    [JsonPropertyName("content")]
    public List<ChatContentBlock> Content { get; set; } = new();

    public static ChatMessage UserText(string text) =>
        new() { Role = "user", Content = { ChatContentBlock.TextBlock(text) } };

    public static ChatMessage UserToolResult(string toolUseId, string result, bool isError = false) =>
        new() { Role = "user", Content = { ChatContentBlock.ToolResultBlock(toolUseId, result, isError) } };
}
