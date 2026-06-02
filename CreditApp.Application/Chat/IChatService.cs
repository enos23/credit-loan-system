using CreditApp.Application.Chat.Dtos;
using CreditApp.Domain.Enums;

namespace CreditApp.Application.Chat;

public interface IChatService
{
    Task<ChatMessageResponse> SendMessageAsync(
        ChatMessageRequest request,
        Guid userId,
        UserRole userRole,
        CancellationToken cancellationToken);
}
