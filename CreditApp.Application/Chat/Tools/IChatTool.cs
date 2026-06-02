using System.Text.Json;
using CreditApp.Domain.Enums;

namespace CreditApp.Application.Chat.Tools;

// A single tool the AI model can call. ChatService discovers all registered
// implementations, filters by the current user's role, and exposes the remaining
// set to Anthropic as tool definitions.
public interface IChatTool
{
    string Name { get; }
    string Description { get; }
    JsonElement InputSchema { get; }
    IReadOnlySet<UserRole> AllowedRoles { get; }

    // Returns a JSON-serialized string the model will see as the tool_result.
    // Throwing surfaces a tool error to the model via is_error=true.
    Task<string> ExecuteAsync(JsonElement input, CancellationToken cancellationToken);
}
