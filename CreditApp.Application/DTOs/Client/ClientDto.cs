using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CreditApp.Application.DTOs.Client;

public class ClientDto
{
    public Guid Id { get; set; }
    public string CNP { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Address { get; set; } = string.Empty;
    public string EmploymentStatus { get; set; } = string.Empty;
    public string MonthlyIncome { get; set; }
    public string MonthlyExpenses { get; set; }

    public DateTime CreatedAt { get; set; }
}

