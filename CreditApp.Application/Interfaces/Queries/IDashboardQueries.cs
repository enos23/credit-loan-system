using CreditApp.Application.DTOs.Dashboard;
using CreditApp.Domain.Enums;

namespace CreditApp.Application.Interfaces.Queries;

public interface IDashboardQueries
{
    Task<int> CountClientsAsync(int? year = null, int? month = null);
    Task<RequestCounts> CountRequestsAsync(int? year = null, int? month = null);
    Task<decimal> SumApprovedAmountAsync(int? year = null, int? month = null);
    Task<IReadOnlyList<MonthlyAggregate>> GetMonthlyStatsAsync(DateTime fromUtc);
    Task<IReadOnlyDictionary<RiskLevel, int>> GetRiskDistributionAsync();
    Task<IReadOnlyList<RecentRequestDto>> GetRecentRequestsAsync(int limit);
}

public record RequestCounts(int Total, int Approved, int Rejected, int Pending);

public record MonthlyAggregate(int Year, int Month, int Total, int Approved, int Rejected);
