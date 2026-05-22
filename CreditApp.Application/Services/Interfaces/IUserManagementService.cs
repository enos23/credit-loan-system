using CreditApp.Application.DTOs.Users;

namespace CreditApp.Application.Services.Interfaces;

public interface IUserManagementService
{
    Task<IEnumerable<UserDto>> GetAllUsersAsync();
    Task<UserDto> CreateUserAsync(CreateUserDto dto);
    Task<UserDto?> UpdateUserAsync(Guid id, UpdateUserDto dto);
    Task<bool> ToggleActiveAsync(Guid id);
}
