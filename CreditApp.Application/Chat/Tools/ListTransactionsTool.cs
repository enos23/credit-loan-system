using System.Text.Json;
using CreditApp.Application.Services.Interfaces;
using CreditApp.Domain.Enums;

namespace CreditApp.Application.Chat.Tools;

public class ListTransactionsTool : IChatTool
{
    private const int MaxItemsReturned = 20;

    private static readonly JsonElement Schema = JsonSerializer.SerializeToElement(new
    {
        type = "object",
        properties = new { },
    });

    private readonly ITransactionService _transactionService;

    public ListTransactionsTool(ITransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    public string Name => "list_transactions";

    public string Description =>
        "Returns disbursed credits: contract count, total disbursed amount, total payable, total interest, average interest rate, and up to 20 most recent transactions with their monthly installment and term.";

    public JsonElement InputSchema => Schema;

    public IReadOnlySet<UserRole> AllowedRoles { get; } =
        new HashSet<UserRole> { UserRole.Admin, UserRole.Analyst };

    public async Task<string> ExecuteAsync(JsonElement input, CancellationToken cancellationToken)
    {
        var summary = await _transactionService.GetAllAsync();

        // Cap the inner collection to keep token usage in check.
        var trimmed = new
        {
            summary.TotalContracts,
            summary.TotalDisbursed,
            summary.TotalPayable,
            summary.TotalInterest,
            summary.AverageInterestRate,
            transactions = summary.Transactions.Take(MaxItemsReturned).ToList(),
            truncated = summary.Transactions.Count > MaxItemsReturned,
        };

        return JsonSerializer.Serialize(trimmed);
    }
}
