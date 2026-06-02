using System.Security.Claims;
using CreditApp.Application.Chat;
using CreditApp.Application.Chat.Dtos;
using CreditApp.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace CreditApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;

    public ChatController(IChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpPost("message")]
    [EnableRateLimiting("chat")]
    public async Task<IActionResult> Message([FromBody] ChatMessageRequest dto, CancellationToken ct)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var roleClaim = User.FindFirstValue(ClaimTypes.Role);
        if (!Guid.TryParse(userIdClaim, out var userId) || !Enum.TryParse<UserRole>(roleClaim, out var role))
            return Unauthorized();

        var response = await _chatService.SendMessageAsync(dto, userId, role, ct);
        return Ok(response);
    }
}
