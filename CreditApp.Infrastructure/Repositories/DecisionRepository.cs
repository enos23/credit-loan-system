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

public class DecisionRepository : IDecisionRepository
{
    private readonly AppDbContext _context;

    public DecisionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Decision?> GetByIdAsync(Guid id)
    {
        return await _context.Decisions
            .Include(d => d.CreditRequest)
            .Include(d => d.Analyst)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<Decision?> GetByCreditRequestIdAsync(Guid creditRequesId)
    {
        return await _context.Decisions
            .Include(d => d.Analyst)
            .FirstOrDefaultAsync(d => d.CreditRequestId == creditRequesId);
    }

    public async Task<IEnumerable<Decision>> GetAllApprovedAsync()
    {
        return await _context.Decisions
            .Include(d => d.CreditRequest)
                .ThenInclude(cr => cr.Client)
            .Include(d => d.Analyst)
            .Where(d => d.DecisionType == CreditApp.Domain.Enums.DecisionType.Approved)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    public async Task AddAsync(Decision decision)
    {
        decision.Id = Guid.NewGuid();
        decision.CreatedAt = DateTime.UtcNow;
        await _context.Decisions.AddAsync(decision);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Decision decision)
    {
        _context.Decisions.Update(decision);
        await _context.SaveChangesAsync();
    }
}