using CreditApp.Application.DTOs.Reports;
using CreditApp.Application.Interfaces.Queries;
using CreditApp.Domain.Enums;
using CreditApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CreditApp.Infrastructure.Queries;

public class ReportsQueries : IReportsQueries
{
    private readonly AppDbContext _context;

    public ReportsQueries(AppDbContext context)
    {
        _context = context;
    }

    public async Task<int> GetAverageCreditScoreAsync()
    {
        // AverageAsync on int with no rows throws; guard with Any() first.
        var query = _context.CreditRequests.AsNoTracking();
        var hasAny = await query.AnyAsync();
        if (!hasAny) return 0;
        var avg = await query.AverageAsync(r => (double)r.CreditScore);
        return (int)Math.Round(avg);
    }

    public async Task<AmountSummary> GetAmountSummaryAsync()
    {
        var query = _context.CreditRequests.AsNoTracking();
        var hasAny = await query.AnyAsync();
        if (!hasAny) return new AmountSummary(0, 0, 0);

        var totalAmount = await query.SumAsync(r => r.Amount);
        var approvedAmount = await query
            .Where(r => r.Status == CreditStatus.Approved)
            .SumAsync(r => r.Amount);
        var avgAmount = await query.AverageAsync(r => r.Amount);

        return new AmountSummary(totalAmount, approvedAmount, Math.Round(avgAmount));
    }

    public async Task<IReadOnlyList<PurposeStatDto>> GetByPurposeAsync()
    {
        // Group by purpose, count, sorted descending by count.
        var rows = await _context.CreditRequests.AsNoTracking()
            .GroupBy(r => r.Purpose)
            .Select(g => new PurposeStatDto { Name = g.Key, Count = g.Count() })
            .ToListAsync();
        return rows.OrderByDescending(r => r.Count).ToList();
    }

    public async Task<IReadOnlyList<AnalystPerformanceDto>> GetAnalystPerformanceAsync()
    {
        // Join Decisions → Users (analyst). Group by analyst, calculate totals.
        // We compute on Decisions table because that's where "who decided what" lives;
        // CreditRequests.AssignedAnalystId is the *assignment*, not the actual decider.
        var rows = await _context.Decisions.AsNoTracking()
            .Include(d => d.Analyst)
            .GroupBy(d => new { d.AnalystId, d.Analyst.FirstName, d.Analyst.LastName })
            .Select(g => new AnalystPerformanceDto
            {
                Name = g.Key.FirstName + " " + g.Key.LastName,
                Total = g.Count(),
                Approved = g.Count(d => d.DecisionType == DecisionType.Approved),
                Rejected = g.Count(d => d.DecisionType == DecisionType.Rejected),
            })
            .ToListAsync();
        return rows.OrderByDescending(r => r.Total).ToList();
    }
}
