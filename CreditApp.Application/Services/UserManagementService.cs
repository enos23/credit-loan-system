using CreditApp.Application.DTOs.Users;
using CreditApp.Application.Services.Interfaces;
using CreditApp.Domain.Entities;
using CreditApp.Domain.Enums;
using CreditApp.Domain.Interfaces;

namespace CreditApp.Application.Services;

public class UserManagementService : IUserManagementService
{
    private readonly IUserRepository _userRepository;

    public UserManagementService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(MapToDto);
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto dto)
    {
        var existing = await _userRepository.GetByEmailAsync(dto.Email);
        if (existing != null)
            throw new InvalidOperationException("Un utilizator cu acest email există deja.");

        if (!Enum.TryParse<UserRole>(dto.Role, out var role))
            throw new InvalidOperationException($"Rolul '{dto.Role}' nu este valid.");

        var user = new User
        {
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Role = role,
            IsActive = true
        };

        await _userRepository.AddAsync(user);
        return MapToDto(user);
    }

    public async Task<UserDto?> UpdateUserAsync(Guid id, UpdateUserDto dto)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return null;

        if (!Enum.TryParse<UserRole>(dto.Role, out var role))
            throw new InvalidOperationException($"Rolul '{dto.Role}' nu este valid.");

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Role = role;

        await _userRepository.UpdateAsync(user);
        return MapToDto(user);
    }

    public async Task<bool> ToggleActiveAsync(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return false;

        user.IsActive = !user.IsActive;
        await _userRepository.UpdateAsync(user);
        return user.IsActive;
    }

    private static UserDto MapToDto(User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Role = user.Role.ToString(),
        IsActive = user.IsActive,
        CreatedAt = user.CreatedAt
    };
}
