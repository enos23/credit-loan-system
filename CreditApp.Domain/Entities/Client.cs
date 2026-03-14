using CreditApp.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using CreditApp.Domain.Enums;

namespace CreditApp.Domain.Entities;

public class Client
{
    public Guid Id { get; set; }
    public string CNP { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Address {  get; set; } = string.Empty;
    public EmploymentStatus EmploymentStatus { get; set; }

    public decimal MonthlyIncome { get; set; }
    public decimal MonthlyExpenses { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public ICollection<CreditRequest> CreditRequests { get; set; } = new List<CreditRequest>();
}

