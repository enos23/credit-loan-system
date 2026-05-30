using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using CreditApp.Application.DTOs.CreditRequest;
using CreditApp.Application.Pagination;

namespace CreditApp.Application.Services.Interfaces;

public interface ICreditRequestService
{
    Task<CreditRequestDto?> GetByIdAsync(Guid id);
    Task<PagedResult<CreditRequestDto>> GetPagedAsync(PageRequest request);
    Task<IEnumerable<CreditRequestDto>> GetByClientIdAsync(Guid clientId);
    Task<CreditRequestDto> CreateAsync(CreateCreditRequestDto dto);
    Task UpdateStatusAsync(Guid id, string status);
}
