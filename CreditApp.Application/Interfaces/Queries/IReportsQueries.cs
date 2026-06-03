using CreditApp.Application.DTOs.Reports;

namespace CreditApp.Application.Interfaces.Queries;

// Aggregates specific to the Reports page. The pieces that overlap with the
// Dashboard (status counts, monthly stats, risk distribution) are pulled from
// IDashboardQueries by the service — no duplication at the query layer.
public interface IReportsQueries
{
    Task<int> GetAverageCreditScoreAsync();
    Task<AmountSummary> GetAmountSummaryAsync();
    Task<IReadOnlyList<PurposeStatDto>> GetByPurposeAsync();
    Task<IReadOnlyList<AnalystPerformanceDto>> GetAnalystPerformanceAsync();
}

public record AmountSummary(decimal TotalAmount, decimal ApprovedAmount, decimal AverageAmount);
