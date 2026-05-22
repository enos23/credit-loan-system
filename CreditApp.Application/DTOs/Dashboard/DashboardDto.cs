namespace CreditApp.Application.DTOs.Dashboard;

public class DashboardDto
{
    public int TotalClients { get; set; }
    public int TotalRequests { get; set; }
    public int ApprovedCount { get; set; }
    public int RejectedCount { get; set; }
    public int PendingCount { get; set; }
    public decimal TotalApprovedAmount { get; set; }
    public double ApprovalRate { get; set; }

    public double? ClientsTrend { get; set; }
    public double? RequestsTrend { get; set; }
    public double? ApprovalTrend { get; set; }
    public double? AmountTrend { get; set; }

    public List<MonthlyStatDto> MonthlyStats { get; set; } = new();
    public List<RiskStatDto> RiskDistribution { get; set; } = new();
    public List<RecentRequestDto> RecentRequests { get; set; } = new();
}

public class MonthlyStatDto
{
    public string Month { get; set; } = string.Empty;
    public int Total { get; set; }
    public int Approved { get; set; }
    public int Rejected { get; set; }
}

public class RiskStatDto
{
    public string Level { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class RecentRequestDto
{
    public Guid Id { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string RiskLevel { get; set; } = string.Empty;
    public int CreditScore { get; set; }
    public DateTime CreatedAt { get; set; }
}
