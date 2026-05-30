using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;

using CreditApp.Domain.Enums;

namespace CreditApp.Domain.Entities;

public class CreditRequest
{
    public Guid Id { get; set; }
    public Guid ClientId { get; set; }
    public Guid? AssignedAnalystId { get; set; }
    public decimal Amount { get; set; }
    public int TermMonths { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public CreditStatus Status { get; set; } = CreditStatus.Pending;
    public int CreditScore { get; set; }
    public RiskLevel RiskLevel { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    //Navigation properties
    public Client Client { get; set; } = null!;
    public User? AssignedAnalyst { get; set; }
    public Decision? Decision { get; set; }
}
