namespace CreditApp.Application.DTOs.Transactions;

public class TransactionDto
{
    public Guid Id { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
    public decimal DisbursedAmount { get; set; }
    public decimal InterestRate { get; set; }
    public int TermMonths { get; set; }
    public decimal MonthlyInstallment { get; set; }
    public decimal TotalPayable { get; set; }
    public decimal TotalInterest { get; set; }
    public string AnalystName { get; set; } = string.Empty;
    public DateTime DisbursedAt { get; set; }
}

public class TransactionSummaryDto
{
    public decimal TotalDisbursed { get; set; }
    public decimal TotalPayable { get; set; }
    public decimal TotalInterest { get; set; }
    public decimal AverageInterestRate { get; set; }
    public int TotalContracts { get; set; }
    public List<TransactionDto> Transactions { get; set; } = new();
}
