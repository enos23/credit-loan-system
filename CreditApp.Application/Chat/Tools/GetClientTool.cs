using System.Text.Json;
using CreditApp.Application.Services.Interfaces;
using CreditApp.Domain.Enums;

namespace CreditApp.Application.Chat.Tools;

public class GetClientTool : IChatTool
{
    private static readonly JsonElement Schema = JsonSerializer.SerializeToElement(new
    {
        type = "object",
        properties = new
        {
            clientId = new { type = "string", description = "GUID of the client. Provide either clientId or cnp, not both." },
            cnp = new { type = "string", description = "13-digit Romanian CNP. Provide either clientId or cnp, not both." },
        },
    });

    private readonly IClientService _clientService;

    public GetClientTool(IClientService clientService)
    {
        _clientService = clientService;
    }

    public string Name => "get_client";

    public string Description =>
        "Fetches the full profile of a single client by GUID or CNP. Returns name, email, employment status, monthly income and expenses.";

    public JsonElement InputSchema => Schema;

    public IReadOnlySet<UserRole> AllowedRoles { get; } =
        new HashSet<UserRole> { UserRole.Admin, UserRole.Analyst, UserRole.Banker };

    public async Task<string> ExecuteAsync(JsonElement input, CancellationToken cancellationToken)
    {
        if (ToolInputHelpers.TryGetGuid(input, "clientId", out var clientId))
        {
            var client = await _clientService.GetByAsyncId(clientId);
            return JsonSerializer.Serialize(client ?? (object)new { error = "Client not found." });
        }

        var cnp = ToolInputHelpers.GetString(input, "cnp");
        if (!string.IsNullOrWhiteSpace(cnp))
        {
            var client = await _clientService.GetByCNPAsync(cnp);
            return JsonSerializer.Serialize(client ?? (object)new { error = "Client not found." });
        }

        throw new InvalidOperationException("Provide either 'clientId' or 'cnp'.");
    }
}
