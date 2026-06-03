using CreditApp.Domain.Entities;

namespace CreditApp.Domain.Interfaces;

public interface IUserPreferenceRepository
{
    Task<UserPreference?> GetByUserIdAsync(Guid userId);
    Task AddAsync(UserPreference preference);
    Task UpdateAsync(UserPreference preference);
}
