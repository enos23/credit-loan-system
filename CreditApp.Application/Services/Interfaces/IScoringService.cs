using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using CreditApp.Domain.Entities;

namespace CreditApp.Application.Services.Interfaces;

public interface IScoringService
{
    int CalculateScore(Client client, decimal requestedAmount, int termMonths);
    string DetermineRiskLevel(int score);
    decimal SuggestInterestRate(int score);
}
