using CreditApp.Application.DTOs.Dashboard;

namespace CreditApp.Application.DTOs.Reports;

public class ReportsDto
{
    // KPI cards
    public int TotalRequests { get; set; }
    public int ApprovedCount { get; set; }
    public int RejectedCount { get; set; }
    public int PendingCount { get; set; }
    public double ApprovalRate { get; set; }
    public int AverageCreditScore { get; set; }

    // Amount cards
    public decimal TotalAmount { get; set; }
    public decimal ApprovedAmount { get; set; }
    public decimal AverageAmount { get; set; }

    // Charts (some shapes reused from Dashboard DTOs)
    public List<MonthlyStatDto> MonthlyStats { get; set; } = new();
    public List<PurposeStatDto> ByPurpose { get; set; } = new();
    public List<RiskStatDto> RiskDistribution { get; set; } = new();
    public List<AnalystPerformanceDto> AnalystPerformance { get; set; } = new();
}

public class PurposeStatDto
{
    public string Name { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class AnalystPerformanceDto
{
    public string Name { get; set; } = string.Empty;
    public int Total { get; set; }
    public int Approved { get; set; }
    public int Rejected { get; set; }
}
