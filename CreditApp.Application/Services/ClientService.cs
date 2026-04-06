using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using CreditApp.Application.DTOs.Client;
using CreditApp.Application.Services.Interfaces;
using CreditApp.Domain.Entities;
using CreditApp.Domain.Enums;
using CreditApp.Domain.Interfaces;

namespace CreditApp.Application.Services;

public class ClientService : IClientService
{
    private readonly IClientRepository _clientRepository;

    public ClientService(IClientRepository clientRepository)
    {
        _clientRepository = clientRepository;
    }

    public async Task<ClientDto?> GetByAsyncId(Guid id)
    {
        var client = await _clientRepository.GetByIdAsync(id);
        return client == null ? null : MapToDto(client);
    }

    public async Task<ClientDto?> GetByCNPAsync(string cnp)
    {
        var client = await _clientRepository.GetByCNPAsync(cnp);
        return client == null ? null : MapToDto(client);
    }

    public async Task<IEnumerable<ClientDto>> GetAllAsync()
    {
        var clients = await _clientRepository.GetAllAsync();
        return clients.Select(MapToDto);
    }

    public async Task<ClientDto> CreateAsync(CreateClientDto dto)
    {
        var existingClient = await _clientRepository.GetByCNPAsync(dto.CNP);
        if (existingClient != null)
            throw new InvalidOperationException("Un client cu acest CNP există deja.");

        var client = new Client
        {
            CNP = dto.CNP,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            DateOfBirth = DateTime.SpecifyKind(dto.DateOfBirth, DateTimeKind.Utc),
            Address = dto.Address,
            EmploymentStatus = Enum.Parse<EmploymentStatus>(dto.EmploymentStatus),
            MonthlyIncome = dto.MonthlyIncome,
            MonthlyExpenses = dto.MonthlyExpenses
        };

        await _clientRepository.AddAsync(client);
        return MapToDto(client);
    }

    public async Task UpdateAsync(Guid id, CreateClientDto dto)
    {
        var client = await _clientRepository.GetByIdAsync(id);
        if (client == null)
            throw new InvalidOperationException("Clientul nu a fost găsit.");

        client.FirstName = dto.FirstName;
        client.LastName = dto.LastName;
        client.Email = dto.Email;
        client.Phone = dto.Phone;
        client.Address = dto.Address;
        client.EmploymentStatus = Enum.Parse<EmploymentStatus>(dto.EmploymentStatus);
        client.MonthlyIncome = dto.MonthlyIncome;
        client.MonthlyExpenses = dto.MonthlyExpenses;

        await _clientRepository.UpdateAsync(client);
    }

    public async Task DeleteAsync(Guid id)
    {
        var client = await _clientRepository.GetByIdAsync(id);
        if (client == null)
            throw new InvalidOperationException("Clientul nu a fost găsit.");

        await _clientRepository.DeleteAsync(id);
    }

    private static ClientDto MapToDto(Client client) => new()
    {
        Id = client.Id,
        CNP = client.CNP,
        FirstName = client.FirstName,
        LastName = client.LastName,
        Email = client.Email,
        Phone = client.Phone,
        DateOfBirth = client.DateOfBirth,
        Address = client.Address,
        EmploymentStatus = client.EmploymentStatus.ToString(),
        MonthlyIncome = client.MonthlyIncome,
        MonthlyExpenses = client.MonthlyExpenses,
        CreatedAt = client.CreatedAt
    };
}
