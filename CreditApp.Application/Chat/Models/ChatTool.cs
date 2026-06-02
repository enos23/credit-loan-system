using System.Text.Json;
using System.Text.Json.Serialization;

namespace CreditApp.Application.Chat.Models;

public class ChatTool
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    // JSON Schema describing the tool's input. Use JsonElement so callers can build
    // it however they want (anonymous object → JsonSerializer.SerializeToElement is the
    // most common pattern).
    [JsonPropertyName("input_schema")]
    public JsonElement InputSchema { get; set; }

    [JsonPropertyName("cache_control")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public CacheControl? CacheControl { get; set; }
}
