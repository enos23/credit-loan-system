using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CreditApp.Application.DTOs.CreditRequest;

public class CreditRequestDto
{
    public Guid Id { get; set; }
    public Guid ClientId { get; set; }
    public string ClientFullName { get; set; } = string.Empty;
    public Guid? AssignedAnalystId { get; set; }
    public string? AssignedAnalystName { get; set; }
    public decimal Amount { get; set; }
    public int TermMonths { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int CreditScore { get; set; }
    public string RiskLevel { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

