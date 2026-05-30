using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using CreditApp.Application.Services.Interfaces;
using CreditApp.Domain.Entities;
using CreditApp.Domain.Enums;

namespace CreditApp.Application.Services;

public class ScoringService : IScoringService
{
    public int CalculateScore(Client client, decimal requestedAmount, int termMonths)
    {
        int score = 0;

        //1. Rata de indatorare (30 puncte)
        decimal monthlyPayment = requestedAmount / termMonths;
        decimal debtRatio = (client.MonthlyExpenses + monthlyPayment) / client.MonthlyIncome;

        score += debtRatio switch
        {
            < 0.30m => 30,
            < 0.40m => 20,
            < 0.50m => 10,
            _ => 0
        };

        //2. Stabileste venit (25 puncte)
        score += client.EmploymentStatus switch
        {
            EmploymentStatus.Employed => 25,
            EmploymentStatus.Retired => 20,
            EmploymentStatus.SelfEmployed => 15,
            EmploymentStatus.Unemployed => 0,
            _ => 0
        };

        //3. Raport suma ceruta / venit anual (25 puncte)
        decimal annualIncome = client.MonthlyIncome * 12;
        decimal incomeRatio = requestedAmount / annualIncome;

        score += incomeRatio switch
        {
            < 12 => 25,
            < 24 => 15,
            < 36 => 5,
            _ => 0
        };

        // 4. Varsta clientului (20 puncte)
        int age = DateTime.UtcNow.Year - client.DateOfBirth.Year;

        score += age switch
        {
            >= 25 and <= 55 => 20,
            >= 18 and <= 24 => 10,
            >= 56 and <= 65 => 15,
            _ => 0
        };

        return Math.Clamp(score, 0, 100);
    }

    public string DetermineRiskLevel(int score) => score switch
    {
        >= 80 => "Low",
        >= 60 => "Medium",
        _ => "High"
    };

    public decimal SuggestInterestRate(int score) => score switch
    {
        >= 80 => 5.5m,
        >= 60 => 9.0m,
        >= 40 => 14.0m,
        _ => 0m
    };

}
