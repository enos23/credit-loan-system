using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using CreditApp.Application.Configuration;
using CreditApp.Application.DTOs.Auth;
using CreditApp.Application.Email;
using CreditApp.Application.Services.Interfaces;
using CreditApp.Application.Validation;
using CreditApp.Domain.Entities;
using CreditApp.Domain.Enums;
using CreditApp.Domain.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace CreditApp.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly JwtSettings _jwtSettings;
    private readonly IEmailService _emailService;
    private readonly EmailSettings _emailSettings;

    public AuthService(
        IUserRepository userRepository,
        IOptions<JwtSettings> jwtOptions,
        IEmailService emailService,
        IOptions<EmailSettings> emailOptions)
    {
        _userRepository = userRepository;
        _jwtSettings = jwtOptions.Value;
        _emailService = emailService;
        _emailSettings = emailOptions.Value;
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email);
        if (user == null || !user.IsActive)
            return null;

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
            if (!isPasswordValid)
                return null;

        return GenerateAuthResponse(user);
    }

    public async Task<AuthResponseDto?> UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return null;

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Phone = dto.Phone;
        user.Bio = dto.Bio;
        user.AvatarGradient = dto.AvatarGradient;

        await _userRepository.UpdateAsync(user);
        return GenerateAuthResponse(user);
    }

    public async Task<string?> ForgotPasswordAsync(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null || !user.IsActive) return null;

        var token = Guid.NewGuid().ToString("N");
        user.ResetPasswordToken = token;
        user.ResetPasswordTokenExpiry = DateTime.UtcNow.AddHours(1);
        await _userRepository.UpdateAsync(user);

        _emailService.Enqueue(EmailTemplates.ResetPassword(
            toEmail: user.Email,
            toName: $"{user.FirstName} {user.LastName}",
            resetToken: token,
            frontendBaseUrl: _emailSettings.FrontendBaseUrl));

        return token;
    }

    public async Task<bool> ResetPasswordAsync(string token, string newPassword)
    {
        PasswordValidator.EnsureValid(newPassword);

        var user = await _userRepository.GetByResetTokenAsync(token);
        if (user == null || user.ResetPasswordTokenExpiry < DateTime.UtcNow)
            return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.ResetPasswordToken = null;
        user.ResetPasswordTokenExpiry = null;
        user.SecurityStamp = Guid.NewGuid();
        await _userRepository.UpdateAsync(user);
        return true;
    }

    public async Task<bool> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword)
    {
        PasswordValidator.EnsureValid(newPassword);

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;

        if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
            return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.SecurityStamp = Guid.NewGuid();
        await _userRepository.UpdateAsync(user);
        return true;
    }

    private AuthResponseDto GenerateAuthResponse(User user)
    {
        var token = GenerateJwtToken(user);
        return new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            FullName = $"{user.FirstName} {user.LastName}",
            Role = user.Role.ToString(),
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.ExpiresInDays),
            Phone = user.Phone,
            Bio = user.Bio,
            AvatarGradient = user.AvatarGradient,
        };
    }

    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
            new Claim("security_stamp", user.SecurityStamp.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(_jwtSettings.ExpiresInDays),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
