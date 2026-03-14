using CreditApp.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CreditApp.Domain.Entities;

public class Decision
{
    public Guid Id { get; set; }
    public Guid CreditRequestId { get; set; }  
    public Guid AnalystId { get; set; }
    public DecisionType DecisionType { get; set; }
    public decimal? InterestRate { get; set; }
    public decimal? ApprovedAmount { get; set; }
    public string Notes { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    //Navigation properties 
    public CreditRequest CreditRequest { get; set; } = null!;
    public User Analyst { get; set; } = null!;
}