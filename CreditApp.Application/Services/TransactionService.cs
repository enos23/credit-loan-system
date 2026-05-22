using CreditApp.Application.DTOs.Transactions;
using CreditApp.Application.Services.Interfaces;
using CreditApp.Domain.Interfaces;

namespace CreditApp.Application.Services;

public class TransactionService : ITransactionService
{
    private readonly IDecisionRepository _decisionRepository;

    public TransactionService(IDecisionRepository decisionRepository)
    {
        _decisionRepository = decisionRepository;
    }

    public async Task<TransactionSummaryDto> GetAllAsync()
    {
        var decisions = (await _decisionRepository.GetAllApprovedAsync()).ToList();

        var transactions = decisions
            .Where(d => d.ApprovedAmount.HasValue && d.InterestRate.HasValue)
            .Select(d =>
            {
                var amount = d.ApprovedAmount!.Value;
                var annualRate = d.InterestRate!.Value;
                var term = d.CreditRequest?.TermMonths ?? 12;
                var monthly = CalculateMonthlyInstallment(amount, annualRate, term);
                var totalPayable = monthly * term;
                var totalInterest = totalPayable - amount;

                return new TransactionDto
                {
                    Id = d.Id,
                    ClientName = d.CreditRequest?.Client != null
                        ? $"{d.CreditRequest.Client.FirstName} {d.CreditRequest.Client.LastName}"
                        : "N/A",
                    Purpose = d.CreditRequest?.Purpose ?? "N/A",
                    DisbursedAmount = amount,
                    InterestRate = annualRate,
                    TermMonths = term,
                    MonthlyInstallment = Math.Round(monthly, 2),
                    TotalPayable = Math.Round(totalPayable, 2),
                    TotalInterest = Math.Round(totalInterest, 2),
                    AnalystName = d.Analyst != null
                        ? $"{d.Analyst.FirstName} {d.Analyst.LastName}"
                        : "N/A",
                    DisbursedAt = d.CreatedAt,
                };
            }).ToList();

        return new TransactionSummaryDto
        {
            TotalContracts = transactions.Count,
            TotalDisbursed = transactions.Sum(t => t.DisbursedAmount),
            TotalPayable = transactions.Sum(t => t.TotalPayable),
            TotalInterest = transactions.Sum(t => t.TotalInterest),
            AverageInterestRate = transactions.Count > 0
                ? Math.Round(transactions.Average(t => t.InterestRate), 2)
                : 0,
            Transactions = transactions,
        };
    }

    private static decimal CalculateMonthlyInstallment(decimal principal, decimal annualRate, int termMonths)
    {
        if (annualRate == 0) return principal / termMonths;
        var r = (double)(annualRate / 100 / 12);
        var n = termMonths;
        var factor = Math.Pow(1 + r, n);
        return (decimal)((double)principal * r * factor / (factor - 1));
    }
}
