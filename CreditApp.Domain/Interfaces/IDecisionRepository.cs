using CreditApp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using CreditApp.Domain.Entities;

namespace CreditApp.Domain.Interfaces;

public interface IDecisionRepository
{
    Task<Decision?> GetByIdAsync(Guid id);
    Task<Decision?> GetByCreditRequestIdAsync(Guid creditRequestId);
    Task AddAsync(Decision decision);
    Task UpdateAsync (Decision decision);
}