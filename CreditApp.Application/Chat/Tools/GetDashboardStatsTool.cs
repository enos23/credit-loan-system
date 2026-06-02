using System.Text.Json;
using CreditApp.Application.Services.Interfaces;
using CreditApp.Domain.Enums;

namespace CreditApp.Application.Chat.Tools;

public class GetDashboardStatsTool : IChatTool
{
    private static readonly JsonElement Schema = JsonSerializer.SerializeToElement(new
    {
        type = "object",
        properties = new { },
    });

    private readonly IDashboardService _dashboardService;

    public GetDashboardStatsTool(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    public string Name => "get_dashboard_stats";

    public string Description =>
        "Returns an aggregated snapshot: total clients, total requests, counts by status (approved/rejected/pending), total approved amount, approval rate, month-over-month trends, last 6 months activity, risk distribution, and 5 most recent requests. Use this for any question about counts, sums, or rates rather than listing and counting manually.";

    public JsonElement InputSchema => Schema;

    public IReadOnlySet<UserRole> AllowedRoles { get; } =
        new HashSet<UserRole> { UserRole.Admin, UserRole.Analyst, UserRole.Banker };

    public async Task<string> ExecuteAsync(JsonElement input, CancellationToken cancellationToken)
    {
        var data = await _dashboardService.GetDashboardAsync();
        return JsonSerializer.Serialize(data);
    }
}
