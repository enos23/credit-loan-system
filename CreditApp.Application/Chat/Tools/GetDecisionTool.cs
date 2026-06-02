using System.Text.Json;
using CreditApp.Application.Services.Interfaces;
using CreditApp.Domain.Enums;

namespace CreditApp.Application.Chat.Tools;

public class GetDecisionTool : IChatTool
{
    private static readonly JsonElement Schema = JsonSerializer.SerializeToElement(new
    {
        type = "object",
        properties = new
        {
            requestId = new { type = "string", description = "GUID of the credit request whose decision to fetch." },
        },
        required = new[] { "requestId" },
    });

    private readonly IDecisionService _decisionService;

    public GetDecisionTool(IDecisionService decisionService)
    {
        _decisionService = decisionService;
    }

    public string Name => "get_decision";

    public string Description =>
        "Fetches the analyst's decision for a credit request: decision type (Approved/Rejected/NeedsMoreInfo), approved amount, interest rate, and the analyst's internal notes. Returns 'not found' if the request has not been decided yet.";

    public JsonElement InputSchema => Schema;

    public IReadOnlySet<UserRole> AllowedRoles { get; } =
        new HashSet<UserRole> { UserRole.Admin, UserRole.Analyst };

    public async Task<string> ExecuteAsync(JsonElement input, CancellationToken cancellationToken)
    {
        var requestId = ToolInputHelpers.GetGuid(input, "requestId");
        var decision = await _decisionService.GetByCreditRequestIdAsync(requestId);
        return JsonSerializer.Serialize(decision ?? (object)new { error = "No decision recorded for this request." });
    }
}
