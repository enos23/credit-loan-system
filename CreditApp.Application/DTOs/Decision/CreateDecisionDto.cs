using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CreditApp.Application.DTOs.Decision;

public class CreateDecisionDto
{
    public Guid CreditRequestId { get; set; }
    public string DecisionType { get; set; } = string.Empty;
    public decimal? InterestRate { get; set; }
    public decimal? ApprovedAmount { get; set; }
    public string Notes { get; set; } = string.Empty;
}
