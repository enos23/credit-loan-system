using System.Globalization;
using CreditApp.Application.DTOs.Dashboard;
using CreditApp.Application.DTOs.Reports;
using CreditApp.Application.Interfaces.Queries;
using CreditApp.Application.Services.Interfaces;
using CreditApp.Domain.Enums;

namespace CreditApp.Application.Services;

public class ReportsService : IReportsService
{
    private readonly IReportsQueries _reportsQueries;
    private readonly IDashboardQueries _dashboardQueries;

    public ReportsService(IReportsQueries reportsQueries, IDashboardQueries dashboardQueries)
    {
        _reportsQueries = reportsQueries;
        _dashboardQueries = dashboardQueries;
    }

    public async Task<ReportsDto> GetReportsAsync()
    {
        var now = DateTime.UtcNow;
        var sixMonthsAgo = new DateTime(now.AddMonths(-5).Year, now.AddMonths(-5).Month, 1, 0, 0, 0, DateTimeKind.Utc);

        // Compose from both query layers. Pieces that already exist in IDashboardQueries
        // are reused — no SQL duplication.
        var counts = await _dashboardQueries.CountRequestsAsync();
        var avgScore = await _reportsQueries.GetAverageCreditScoreAsync();
        var amounts = await _reportsQueries.GetAmountSummaryAsync();
        var monthly = await _dashboardQueries.GetMonthlyStatsAsync(sixMonthsAgo);
        var byPurpose = await _reportsQueries.GetByPurposeAsync();
        var risk = await _dashboardQueries.GetRiskDistributionAsync();
        var analystPerf = await _reportsQueries.GetAnalystPerformanceAsync();

        // Translate raw monthly aggregates into display-shaped MonthlyStatDto with
        // localized month names. Fill zeros for empty buckets. Same pattern as DashboardService.
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

        return new ReportsDto
        {
            TotalRequests = counts.Total,
            ApprovedCount = counts.Approved,
            RejectedCount = counts.Rejected,
            PendingCount = counts.Pending,
            ApprovalRate = counts.Total > 0 ? Math.Round((double)counts.Approved / counts.Total * 100, 1) : 0,
            AverageCreditScore = avgScore,

            TotalAmount = amounts.TotalAmount,
            ApprovedAmount = amounts.ApprovedAmount,
            AverageAmount = amounts.AverageAmount,

            MonthlyStats = monthlyStats,
            ByPurpose = byPurpose.ToList(),
            RiskDistribution = riskDistribution,
            AnalystPerformance = analystPerf.ToList(),
        };
    }
}
