using System.Text.Json;

namespace CreditApp.Application.Chat.Tools;

internal static class ToolInputHelpers
{
    public static Guid GetGuid(JsonElement input, string name)
    {
        if (!input.TryGetProperty(name, out var prop) || prop.ValueKind != JsonValueKind.String)
            throw new InvalidOperationException($"Tool input missing required field '{name}'.");
        if (!Guid.TryParse(prop.GetString(), out var value))
            throw new InvalidOperationException($"Tool input field '{name}' is not a valid GUID.");
        return value;
    }

    public static bool TryGetGuid(JsonElement input, string name, out Guid value)
    {
        value = default;
        if (!input.TryGetProperty(name, out var prop) || prop.ValueKind != JsonValueKind.String)
            return false;
        return Guid.TryParse(prop.GetString(), out value);
    }

    public static string? GetString(JsonElement input, string name)
    {
        if (!input.TryGetProperty(name, out var prop) || prop.ValueKind != JsonValueKind.String)
            return null;
        return prop.GetString();
    }

    public static int GetInt(JsonElement input, string name, int defaultValue)
    {
        if (!input.TryGetProperty(name, out var prop) || prop.ValueKind != JsonValueKind.Number)
            return defaultValue;
        return prop.TryGetInt32(out var n) ? n : defaultValue;
    }
}
