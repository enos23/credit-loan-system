using CreditApp.Domain.Entities;
using CreditApp.Domain.Interfaces;
using CreditApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CreditApp.Infrastructure.Repositories;

public class UserPreferenceRepository : IUserPreferenceRepository
{
    private readonly AppDbContext _context;

    public UserPreferenceRepository(AppDbContext context)
    {
        _context = context;
    }

    public Task<UserPreference?> GetByUserIdAsync(Guid userId) =>
        _context.UserPreferences.FirstOrDefaultAsync(p => p.UserId == userId);

    public async Task AddAsync(UserPreference preference)
    {
        preference.Id = Guid.NewGuid();
        preference.CreatedAt = DateTime.UtcNow;
        preference.UpdatedAt = DateTime.UtcNow;
        await _context.UserPreferences.AddAsync(preference);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(UserPreference preference)
    {
        preference.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }
}
