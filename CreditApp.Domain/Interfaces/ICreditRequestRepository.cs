using CreditApp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using CreditApp.Domain.Entities;

namespace CreditApp.Domain.Interfaces;

public interface ICreditRequestRepository
{
    Task<CreditRequest?> GetByIdAsync(Guid id);
    Task<(IReadOnlyList<CreditRequest> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, string? search);
    Task<IEnumerable<CreditRequest>> GetByClientIdAsync(Guid clientId);
    Task AddAsync(CreditRequest creditRequest);
    Task UpdateAsync(CreditRequest creditRequest);
}
