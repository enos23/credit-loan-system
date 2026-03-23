using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CreditApp.Application.DTOs.CreditRequest;

public class CreateCreditRequestDto
{
    public Guid ClientId { get; set; }
    public decimal Amout { get; set; }
    public int TermMonths { get; set; }
    public string Purpose { get; set; } = string.Empty;

}