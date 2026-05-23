using System.Globalization;
using CreditApp.Application.DTOs.Dashboard;
using CreditApp.Application.Interfaces.Queries;
using CreditApp.Application.Services.Interfaces;
using CreditApp.Domain.Enums;

namespace CreditApp.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IDashboardQueries _queries;

    public DashboardService(IDashboardQueries queries)
    {
        _queries = queries;
    }

    public async Task<DashboardDto> GetDashboardAsync()
    {
        var now = DateTime.UtcNow;
        var prevMonth = now.AddMonths(-1);
        var sixMonthsAgo = new DateTime(now.AddMonths(-5).Year, now.AddMonths(-5).Month, 1, 0, 0, 0, DateTimeKind.Utc);

        // Aggregated reads — each maps to one indexed query, not a full table scan.
        var totalClients = await _queries.CountClientsAsync();
        var clientsCur = await _queries.CountClientsAsync(now.Year, now.Month);
        var clientsPrev = await _queries.CountClientsAsync(prevMonth.Year, prevMonth.Month);

        var allCounts = await _queries.CountRequestsAsync();
        var curCounts = await _queries.CountRequestsAsync(now.Year, now.Month);
        var prevCounts = await _queries.CountRequestsAsync(prevMonth.Year, prevMonth.Month);

        var totalApprovedAmount = await _queries.SumApprovedAmountAsync();
        var amountCur = await _queries.SumApprovedAmountAsync(now.Year, now.Month);
        var amountPrev = await _queries.SumApprovedAmountAsync(prevMonth.Year, prevMonth.Month);

        var monthly = await _queries.GetMonthlyStatsAsync(sixMonthsAgo);
        var risk = await _queries.GetRiskDistributionAsync();
        var recent = await _queries.GetRecentRequestsAsync(5);

        double rateCur = curCounts.Total > 0 ? (double)curCounts.Approved / curCounts.Total * 100 : 0;
        double ratePrev = prevCounts.Total > 0 ? (double)prevCounts.Approved / prevCounts.Total * 100 : 0;

        // Last 6 months including the current one; fill zeros for empty buckets.
        var ro = new CultureInfo("ro-RO");
        var monthlyStats = new List<MonthlyStatDto>();
        for (int i = 5; i >= 0; i--)
        {
            var m = now.AddMonths(-i);
            var bucket = monthly.FirstOrDefault(b => b.Year == m.Year && b.Month == m.Month);
            monthlyStats.Add(new MonthlyStatDto
            {
                Month = m.ToString("MMM", ro),
                Total = bucket?.Total ?? 0,
                Approved = bucket?.Approved ?? 0,
                Rejected = bucket?.Rejected ?? 0,
            });
        }

        var riskLabels = new Dictionary<RiskLevel, string>
        {
            { RiskLevel.Low, "Scăzut" },
            { RiskLevel.Medium, "Mediu" },
            { RiskLevel.High, "Ridicat" },
        };
        var riskDistribution = Enum.GetValues<RiskLevel>()
            .Select(r => new RiskStatDto
            {
                Level = r.ToString(),
                Label = riskLabels[r],
                Count = risk.TryGetValue(r, out var c) ? c : 0,
            }).ToList();

        return new DashboardDto
        {
            TotalClients = totalClients,
            TotalRequests = allCounts.Total,
            ApprovedCount = allCounts.Approved,
            RejectedCount = allCounts.Rejected,
            PendingCount = allCounts.Pending,
            TotalApprovedAmount = totalApprovedAmount,
            ApprovalRate = allCounts.Total > 0 ? Math.Round((double)allCounts.Approved / allCounts.Total * 100, 1) : 0,

            ClientsTrend = Trend(clientsCur, clientsPrev),
            RequestsTrend = Trend(curCounts.Total, prevCounts.Total),
            ApprovalTrend = Trend(rateCur, ratePrev),
            AmountTrend = Trend((double)amountCur, (double)amountPrev),

            MonthlyStats = monthlyStats,
            RiskDistribution = riskDistribution,
            RecentRequests = recent.ToList(),
        };
    }

    private static double? Trend(double current, double previous)
    {
        if (previous == 0) return null;
        return Math.Round((current - previous) / previous * 100, 1);
    }
}
