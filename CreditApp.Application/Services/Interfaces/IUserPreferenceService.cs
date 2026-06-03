using CreditApp.Application.DTOs.Users;

namespace CreditApp.Application.Services.Interfaces;

public interface IUserPreferenceService
{
    // Get-or-create: returns the user's stored preferences, or creates a fresh
    // row with defaults if none exists. Callers don't need to handle "missing" state.
    Task<UserPreferencesDto> GetOrCreateAsync(Guid userId);

    // Upserts. Validates fields server-side (allowed languages, themes, etc.).
    Task<UserPreferencesDto> UpdateAsync(Guid userId, UserPreferencesDto dto);
}
