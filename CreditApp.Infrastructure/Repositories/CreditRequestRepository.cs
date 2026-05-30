using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using CreditApp.Domain.Entities;
using CreditApp.Domain.Interfaces;
using CreditApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CreditApp.Infrastructure.Repositories;

public class CreditRequestRepository : ICreditRequestRepository
{
    private readonly AppDbContext _context;

    public CreditRequestRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CreditRequest?> GetByIdAsync(Guid id)
    {
        return await _context.CreditRequests
            .Include(cr => cr.Client)
            .Include(cr => cr.Decision)
            .Include(cr => cr.AssignedAnalyst)
            .FirstOrDefaultAsync(cr => cr.Id == id);
    }

    public async Task<(IReadOnlyList<CreditRequest> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, string? search)
    {
        var query = _context.CreditRequests.AsNoTracking()
            .Include(cr => cr.Client)
            .Include(cr => cr.AssignedAnalyst);

        var filtered = string.IsNullOrWhiteSpace(search)
            ? query
            : query.Where(cr =>
                EF.Functions.ILike(cr.Client.FirstName, $"%{search.Trim()}%") ||
                EF.Functions.ILike(cr.Client.LastName, $"%{search.Trim()}%") ||
                EF.Functions.ILike(cr.Purpose, $"%{search.Trim()}%"));

        var totalCount = await filtered.CountAsync();
        var items = await filtered
            .OrderByDescending(cr => cr.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<IEnumerable<CreditRequest>> GetByClientIdAsync(Guid clientId)
    {
        return await _context.CreditRequests
            .Include(cr => cr.Decision)
            .Where(cr => cr.ClientId == clientId)
            .OrderByDescending(cr => cr.CreatedAt)
            .ToListAsync();
    }

    public async Task AddAsync(CreditRequest creditRequest)
    {
        creditRequest.Id = Guid.NewGuid();
        creditRequest.CreatedAt = DateTime.UtcNow;
        creditRequest.UpdatedAt = DateTime.UtcNow;
        await _context.CreditRequests.AddAsync(creditRequest);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(CreditRequest creditRequest)
    {
        creditRequest.UpdatedAt = DateTime.UtcNow;
        _context.CreditRequests.Update(creditRequest);
        await _context.SaveChangesAsync();
    }
}
