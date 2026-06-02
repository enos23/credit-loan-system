using System.Text.Json;
using CreditApp.Application.Pagination;
using CreditApp.Application.Services.Interfaces;
using CreditApp.Domain.Enums;

namespace CreditApp.Application.Chat.Tools;

public class ListClientsTool : IChatTool
{
    private const int MaxPageSize = 50;

    private static readonly JsonElement Schema = JsonSerializer.SerializeToElement(new
    {
        type = "object",
        properties = new
        {
            page = new { type = "integer", description = "1-indexed page number. Default: 1." },
            pageSize = new { type = "integer", description = "Items per page, max 50. Default: 20." },
            search = new { type = "string", description = "Case-insensitive substring match on first/last name, email, or CNP." },
        },
    });

    private readonly IClientService _clientService;

    public ListClientsTool(IClientService clientService)
    {
        _clientService = clientService;
    }

    public string Name => "list_clients";

    public string Description =>
        "Lists clients paginated, optionally filtered by a search term. Use this to find clients by partial name or to browse the roster.";

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

        var result = await _clientService.GetPagedAsync(request);
        return JsonSerializer.Serialize(result);
    }
}
