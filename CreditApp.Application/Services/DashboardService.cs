using System.Globalization;
using CreditApp.Application.DTOs.Dashboard;
using CreditApp.Application.Services.Interfaces;
using CreditApp.Domain.Enums;
using CreditApp.Domain.Interfaces;

namespace CreditApp.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IClientRepository _clientRepository;
    private readonly ICreditRequestRepository _creditRequestRepository;

    public DashboardService(IClientRepository clientRepository, ICreditRequestRepository creditRequestRepository)
    {
        _clientRepository = clientRepository;
        _creditRequestRepository = creditRequestRepository;
    }

    public async Task<DashboardDto> GetDashboardAsync()
    {
        var clients = (await _clientRepository.GetAllAsync()).ToList();
        var requests = (await _creditRequestRepository.GetAllAsync()).ToList();

        var now = DateTime.UtcNow;
        var prevMonth = now.AddMonths(-1);

        var approved = requests.Where(r => r.Status == CreditStatus.Approved).ToList();
        var rejected = requests.Where(r => r.Status == CreditStatus.Rejected).ToList();
        var pending = requests.Where(r => r.Status == CreditStatus.Pending).ToList();

        // Current vs previous month for trends
        int clientsCur = clients.Count(c => c.CreatedAt.Year == now.Year && c.CreatedAt.Month == now.Month);
        int clientsPrev = clients.Count(c => c.CreatedAt.Year == prevMonth.Year && c.CreatedAt.Month == prevMonth.Month);

        int requestsCur = requests.Count(r => r.CreatedAt.Year == now.Year && r.CreatedAt.Month == now.Month);
        int requestsPrev = requests.Count(r => r.CreatedAt.Year == prevMonth.Year && r.CreatedAt.Month == prevMonth.Month);

        var approvedCur = requests.Where(r => r.Status == CreditStatus.Approved && r.CreatedAt.Year == now.Year && r.CreatedAt.Month == now.Month).ToList();
        var approvedPrev = requests.Where(r => r.Status == CreditStatus.Approved && r.CreatedAt.Year == prevMonth.Year && r.CreatedAt.Month == prevMonth.Month).ToList();
        var requestsCurMonth = requests.Where(r => r.CreatedAt.Year == now.Year && r.CreatedAt.Month == now.Month).ToList();
        var requestsPrevMonth = requests.Where(r => r.CreatedAt.Year == prevMonth.Year && r.CreatedAt.Month == prevMonth.Month).ToList();

        double rateCur = requestsCurMonth.Count > 0 ? (double)approvedCur.Count / requestsCurMonth.Count * 100 : 0;
        double ratePrev = requestsPrevMonth.Count > 0 ? (double)approvedPrev.Count / requestsPrevMonth.Count * 100 : 0;

        decimal amountCur = approvedCur.Sum(r => r.Amount);
        decimal amountPrev = approvedPrev.Sum(r => r.Amount);

        // Monthly stats for last 6 months
        var ro = new CultureInfo("ro-RO");
        var monthlyStats = new List<MonthlyStatDto>();
        for (int i = 5; i >= 0; i--)
        {
            var m = now.AddMonths(-i);
            var monthReqs = requests.Where(r => r.CreatedAt.Year == m.Year && r.CreatedAt.Month == m.Month).ToList();
            monthlyStats.Add(new MonthlyStatDto
            {
                Month = m.ToString("MMM", ro),
                Total = monthReqs.Count,
                Approved = monthReqs.Count(r => r.Status == CreditStatus.Approved),
                Rejected = monthReqs.Count(r => r.Status == CreditStatus.Rejected),
            });
        }

        // Risk distribution
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
                Count = requests.Count(cr => cr.RiskLevel == r),
            }).ToList();

        // Recent 5 requests
        var recentRequests = requests.Take(5).Select(r => new RecentRequestDto
        {
            Id = r.Id,
            ClientName = r.Client != null ? $"{r.Client.FirstName} {r.Client.LastName}" : "N/A",
            Amount = r.Amount,
            Status = r.Status.ToString(),
            RiskLevel = r.RiskLevel.ToString(),
            CreditScore = r.CreditScore,
            CreatedAt = r.CreatedAt,
        }).ToList();

        return new DashboardDto
        {
            TotalClients = clients.Count,
            TotalRequests = requests.Count,
            ApprovedCount = approved.Count,
            RejectedCount = rejected.Count,
            PendingCount = pending.Count,
            TotalApprovedAmount = approved.Sum(r => r.Amount),
            ApprovalRate = requests.Count > 0 ? Math.Round((double)approved.Count / requests.Count * 100, 1) : 0,

            ClientsTrend = Trend(clientsCur, clientsPrev),
            RequestsTrend = Trend(requestsCur, requestsPrev),
            ApprovalTrend = Trend(rateCur, ratePrev),
            AmountTrend = Trend((double)amountCur, (double)amountPrev),

            MonthlyStats = monthlyStats,
            RiskDistribution = riskDistribution,
            RecentRequests = recentRequests,
        };
    }

    private static double? Trend(double current, double previous)
    {
        if (previous == 0) return null;
        return Math.Round((current - previous) / previous * 100, 1);
    }
}
