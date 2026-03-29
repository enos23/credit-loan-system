using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using CreditApp.Application.DTOs.CreditRequest;

namespace CreditApp.Application.Services.Interfaces;

public interface ICreditRequestService
{
    Task<CreditRequestDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<CreditRequestDto>> GetAllAsync();
    Task<IEnumerable<CreditRequestDto>> GetByClientIdAsync(Guid clientId);
    Task<CreditRequestDto> CreateAsync(CreateCreditRequestDto dto);
    Task UpdateStatusAsync(Guid id, string status);
}
