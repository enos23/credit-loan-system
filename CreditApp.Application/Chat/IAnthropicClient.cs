using CreditApp.Application.Chat.Models;

namespace CreditApp.Application.Chat;

// Low-level wrapper around the Anthropic /v1/messages endpoint.
// One call = one round-trip. Tool-use orchestration (running tools, looping
// until stop_reason is "end_turn") lives in ChatService, not here.
public interface IAnthropicClient
{
    Task<ChatResponse> SendAsync(ChatRequest request, CancellationToken cancellationToken = default);
}
