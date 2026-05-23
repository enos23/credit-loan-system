using System.Security.Claims;
using CreditApp.Application.DTOs.Auth;
using CreditApp.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;


namespace CreditApp.API.Controllers;


[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IWebHostEnvironment _env;

    public AuthController(IAuthService authService, IWebHostEnvironment env)
    {
        _authService = authService;
        _env = env;
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        if (result == null)
            return Unauthorized("Email sau parolă incorectă.");

        return Ok(result);
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var result = await _authService.UpdateProfileAsync(userId, dto);
        if (result == null) return NotFound();

        return Ok(result);
    }

    // TODO: when email sending is wired up, deliver the token via email and stop returning it here entirely.
    [HttpPost("forgot-password")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        var token = await _authService.ForgotPasswordAsync(dto.Email);
        const string message = "Dacă adresa există în sistem, veți primi un cod de resetare.";

        if (token != null && _env.IsDevelopment())
            return Ok(new { token, message });

        return Ok(new { message });
    }

    [HttpPost("reset-password")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var result = await _authService.ResetPasswordAsync(dto.Token, dto.NewPassword);
        if (!result)
            return BadRequest("Codul de resetare este invalid sau a expirat.");

        return Ok(new { message = "Parola a fost resetată cu succes." });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var result = await _authService.ChangePasswordAsync(userId, dto.CurrentPassword, dto.NewPassword);
        if (!result)
            return BadRequest("Parola curentă este incorectă.");

        return Ok(new { message = "Parola a fost actualizată cu succes." });
    }
}
