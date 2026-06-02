using System.ComponentModel.DataAnnotations;
using CreditApp.Application.Chat.Models;

namespace CreditApp.Application.Chat.Dtos;

public class ChatMessageRequest
{
    [Required, MinLength(1)]
    public string Message { get; set; } = string.Empty;

    // Prior conversation turns. Stays fully on the client (no DB persistence),
    // sent back to the server on each request so the model has context.
    public List<ChatMessage> History { get; set; } = new();
}
