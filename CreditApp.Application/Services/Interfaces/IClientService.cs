using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using CreditApp.Application.DTOs.Client;
using CreditApp.Application.Pagination;

namespace CreditApp.Application.Services.Interfaces;

public interface IClientService
{
    Task<ClientDto?> GetByAsyncId(Guid id);
    Task<ClientDto?> GetByCNPAsync(string cnp);
    Task<PagedResult<ClientDto>> GetPagedAsync(PageRequest request);
    Task<ClientDto> CreateAsync(CreateClientDto dto);
    Task UpdateAsync(Guid id, CreateClientDto dto);
    Task DeleteAsync(Guid id);
}
