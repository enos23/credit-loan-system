using CreditApp.Application.DTOs.Transactions;

namespace CreditApp.Application.Services.Interfaces;

public interface ITransactionService
{
    Task<TransactionSummaryDto> GetAllAsync();
}
