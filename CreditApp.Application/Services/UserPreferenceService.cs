using CreditApp.Application.DTOs.Users;
using CreditApp.Application.Services.Interfaces;
using CreditApp.Domain.Entities;
using CreditApp.Domain.Interfaces;

namespace CreditApp.Application.Services;

public class UserPreferenceService : IUserPreferenceService
{
    // Whitelists for fields that take a constrained value. Anything outside the
    // list is rejected with a clear error, mapped to 400 by the global handler.
    private static readonly HashSet<string> AllowedLanguages = new(StringComparer.OrdinalIgnoreCase)
    {
        "ro", "en"
    };
    private static readonly HashSet<string> AllowedDateFormats = new(StringComparer.OrdinalIgnoreCase)
    {
        "dd/mm/yyyy", "mm/dd/yyyy", "yyyy-mm-dd"
    };
    private static readonly HashSet<string> AllowedThemes = new(StringComparer.OrdinalIgnoreCase)
    {
        "light", "dark", "system"
    };
    private static readonly int[] AllowedItemsPerPage = { 5, 10, 25, 50 };

    private readonly IUserPreferenceRepository _repository;

    public UserPreferenceService(IUserPreferenceRepository repository)
    {
        _repository = repository;
    }

    public async Task<UserPreferencesDto> GetOrCreateAsync(Guid userId)
    {
        var existing = await _repository.GetByUserIdAsync(userId);
        if (existing != null) return MapToDto(existing);

        // Lazy-create a row with defaults so subsequent reads have a stable shape.
        var fresh = new UserPreference { UserId = userId };
        await _repository.AddAsync(fresh);
        return MapToDto(fresh);
    }

    public async Task<UserPreferencesDto> UpdateAsync(Guid userId, UserPreferencesDto dto)
    {
        Validate(dto);

        var entity = await _repository.GetByUserIdAsync(userId);
        if (entity == null)
        {
            // First-time save: create with the submitted values.
            entity = new UserPreference { UserId = userId };
            Apply(entity, dto);
            await _repository.AddAsync(entity);
        }
        else
        {
            Apply(entity, dto);
            await _repository.UpdateAsync(entity);
        }

        return MapToDto(entity);
    }

    private static void Validate(UserPreferencesDto dto)
    {
        if (!AllowedLanguages.Contains(dto.Language))
            throw new InvalidOperationException($"Limba '{dto.Language}' nu este suportată.");
        if (!AllowedDateFormats.Contains(dto.DateFormat))
            throw new InvalidOperationException($"Formatul de dată '{dto.DateFormat}' nu este valid.");
        if (!AllowedThemes.Contains(dto.Theme))
            throw new InvalidOperationException($"Tema '{dto.Theme}' nu este validă.");
        if (Array.IndexOf(AllowedItemsPerPage, dto.ItemsPerPage) < 0)
            throw new InvalidOperationException($"Înregistrări per pagină trebuie să fie unul din: {string.Join(", ", AllowedItemsPerPage)}.");
    }

    private static void Apply(UserPreference entity, UserPreferencesDto dto)
    {
        entity.NotifyEmailNewRequest = dto.NotifyEmailNewRequest;
        entity.NotifyEmailDecision = dto.NotifyEmailDecision;
        entity.NotifyBrowserAlerts = dto.NotifyBrowserAlerts;
        entity.NotifyWeeklyReport = dto.NotifyWeeklyReport;
        entity.Language = dto.Language;
        entity.DateFormat = dto.DateFormat;
        entity.ItemsPerPage = dto.ItemsPerPage;
        entity.Theme = dto.Theme;
    }

    private static UserPreferencesDto MapToDto(UserPreference p) => new()
    {
        NotifyEmailNewRequest = p.NotifyEmailNewRequest,
        NotifyEmailDecision = p.NotifyEmailDecision,
        NotifyBrowserAlerts = p.NotifyBrowserAlerts,
        NotifyWeeklyReport = p.NotifyWeeklyReport,
        Language = p.Language,
        DateFormat = p.DateFormat,
        ItemsPerPage = p.ItemsPerPage,
        Theme = p.Theme,
    };
}
