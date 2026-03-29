using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using CreditApp.Application.DTOs.Client;

namespace CreditApp.Application.Services.Interfaces;

public interface IClientService
{
    Task<ClientDto?> GetByAsyncId(Guid id);
    Task<ClientDto?> GetByCNPAsync(string cnp);
    Task<IEnumerable<ClientDto>> GetAllAsync();
    Task<ClientDto> CreateAsync(CreateClientDto dto);
    Task UpdateAsync(Guid id, CreateClientDto dto);
    Task DeleteAsync(Guid id);
}
