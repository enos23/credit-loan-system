using CreditApp.Application.DTOs.Dashboard;
using CreditApp.Application.Interfaces.Queries;
using CreditApp.Domain.Enums;
using CreditApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CreditApp.Infrastructure.Queries;

public class DashboardQueries : IDashboardQueries
{
    private readonly AppDbContext _context;

    public DashboardQueries(AppDbContext context)
    {
        _context = context;
    }

    public Task<int> CountClientsAsync(int? year = null, int? month = null)
    {
        var query = _context.Clients.AsNoTracking();
        if (year.HasValue) query = query.Where(c => c.CreatedAt.Year == year.Value);
        if (month.HasValue) query = query.Where(c => c.CreatedAt.Month == month.Value);
        return query.CountAsync();
    }

    public async Task<RequestCounts> CountRequestsAsync(int? year = null, int? month = null)
    {
        var query = _context.CreditRequests.AsNoTracking();
        if (year.HasValue) query = query.Where(r => r.CreatedAt.Year == year.Value);
        if (month.HasValue) query = query.Where(r => r.CreatedAt.Month == month.Value);

        // One round-trip: group by status and pivot on the client side. The result set
        // is at most 4 rows regardless of the underlying request count.
        var byStatus = await query
            .GroupBy(r => r.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        int Get(CreditStatus s) => byStatus.FirstOrDefault(x => x.Status == s)?.Count ?? 0;
        var approved = Get(CreditStatus.Approved);
        var rejected = Get(CreditStatus.Rejected);
        var pending = Get(CreditStatus.Pending) + Get(CreditStatus.UnderReview);

        return new RequestCounts(byStatus.Sum(x => x.Count), approved, rejected, pending);
    }

    public async Task<decimal> SumApprovedAmountAsync(int? year = null, int? month = null)
    {
        var query = _context.CreditRequests.AsNoTracking()
            .Where(r => r.Status == CreditStatus.Approved);
        if (year.HasValue) query = query.Where(r => r.CreatedAt.Year == year.Value);
        if (month.HasValue) query = query.Where(r => r.CreatedAt.Month == month.Value);

        // SumAsync on decimal returns 0 if no rows match, no null handling needed.
        return await query.SumAsync(r => r.Amount);
    }

    public async Task<IReadOnlyList<MonthlyAggregate>> GetMonthlyStatsAsync(DateTime fromUtc)
    {
        var buckets = await _context.CreditRequests.AsNoTracking()
            .Where(r => r.CreatedAt >= fromUtc)
            .GroupBy(r => new { r.CreatedAt.Year, r.CreatedAt.Month })
            .Select(g => new MonthlyAggregate(
                g.Key.Year,
                g.Key.Month,
                g.Count(),
                g.Count(r => r.Status == CreditStatus.Approved),
                g.Count(r => r.Status == CreditStatus.Rejected)))
            .ToListAsync();
        return buckets;
    }

    public async Task<IReadOnlyDictionary<RiskLevel, int>> GetRiskDistributionAsync()
    {
        var rows = await _context.CreditRequests.AsNoTracking()
            .GroupBy(r => r.RiskLevel)
            .Select(g => new { Level = g.Key, Count = g.Count() })
            .ToListAsync();
        return rows.ToDictionary(x => x.Level, x => x.Count);
    }

    public async Task<IReadOnlyList<RecentRequestDto>> GetRecentRequestsAsync(int limit)
    {
        return await _context.CreditRequests.AsNoTracking()
            .OrderByDescending(r => r.CreatedAt)
            .Take(limit)
            .Select(r => new RecentRequestDto
            {
                Id = r.Id,
                ClientName = r.Client != null ? r.Client.FirstName + " " + r.Client.LastName : "N/A",
                Amount = r.Amount,
                Status = r.Status.ToString(),
                RiskLevel = r.RiskLevel.ToString(),
                CreditScore = r.CreditScore,
                CreatedAt = r.CreatedAt,
            })
            .ToListAsync();
    }
}
