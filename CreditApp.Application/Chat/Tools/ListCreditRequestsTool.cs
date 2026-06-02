using System.Text.Json;
using CreditApp.Application.Pagination;
using CreditApp.Application.Services.Interfaces;
using CreditApp.Domain.Enums;

namespace CreditApp.Application.Chat.Tools;

public class ListCreditRequestsTool : IChatTool
{
    private const int MaxPageSize = 50;

    private static readonly JsonElement Schema = JsonSerializer.SerializeToElement(new
    {
        type = "object",
        properties = new
        {
            page = new { type = "integer", description = "1-indexed page number. Default: 1." },
            pageSize = new { type = "integer", description = "Items per page, max 50. Default: 20." },
            search = new { type = "string", description = "Case-insensitive substring match on client name or purpose." },
        },
    });

    private readonly ICreditRequestService _creditRequestService;

    public ListCreditRequestsTool(ICreditRequestService creditRequestService)
    {
        _creditRequestService = creditRequestService;
    }

    public string Name => "list_credit_requests";

    public string Description =>
        "Lists credit requests paginated, ordered by creation date desc. Each item includes status (Pending/UnderReview/Approved/Rejected), risk level, credit score, and assigned analyst. For aggregate counts by status, prefer get_dashboard_stats.";

    public JsonElement InputSchema => Schema;

    public IReadOnlySet<UserRole> AllowedRoles { get; } =
        new HashSet<UserRole> { UserRole.Admin, UserRole.Analyst, UserRole.Banker };

    public async Task<string> ExecuteAsync(JsonElement input, CancellationToken cancellationToken)
    {
        var request = new PageRequest
        {
            Page = ToolInputHelpers.GetInt(input, "page", 1),
            PageSize = Math.Min(ToolInputHelpers.GetInt(input, "pageSize", 20), MaxPageSize),
            Search = ToolInputHelpers.GetString(input, "search"),
        };

        var result = await _creditRequestService.GetPagedAsync(request);
        return JsonSerializer.Serialize(result);
    }
}
