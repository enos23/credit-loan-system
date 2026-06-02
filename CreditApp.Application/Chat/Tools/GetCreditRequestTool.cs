using System.Text.Json;
using CreditApp.Application.Services.Interfaces;
using CreditApp.Domain.Enums;

namespace CreditApp.Application.Chat.Tools;

public class GetCreditRequestTool : IChatTool
{
    private static readonly JsonElement Schema = JsonSerializer.SerializeToElement(new
    {
        type = "object",
        properties = new
        {
            requestId = new { type = "string", description = "GUID of the credit request." },
        },
        required = new[] { "requestId" },
    });

    private readonly ICreditRequestService _creditRequestService;

    public GetCreditRequestTool(ICreditRequestService creditRequestService)
    {
        _creditRequestService = creditRequestService;
    }

    public string Name => "get_credit_request";

    public string Description =>
        "Fetches a single credit request by GUID, including client info, amount, term, purpose, status, credit score, and risk level.";

    public JsonElement InputSchema => Schema;

    public IReadOnlySet<UserRole> AllowedRoles { get; } =
        new HashSet<UserRole> { UserRole.Admin, UserRole.Analyst, UserRole.Banker };

    public async Task<string> ExecuteAsync(JsonElement input, CancellationToken cancellationToken)
    {
        var requestId = ToolInputHelpers.GetGuid(input, "requestId");
        var request = await _creditRequestService.GetByIdAsync(requestId);
        return JsonSerializer.Serialize(request ?? (object)new { error = "Credit request not found." });
    }
}
