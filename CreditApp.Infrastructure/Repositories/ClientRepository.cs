using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using CreditApp.Domain.Entities;
using CreditApp.Domain.Interfaces;
using CreditApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CreditApp.Infrastructure.Repositories;

public class ClientRepository : IClientRepository
{
    private readonly AppDbContext _context;

    public ClientRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Client?> GetByIdAsync(Guid id)
    {
        return await _context.Clients.FindAsync(id);
    }

    public async Task<Client?> GetByCNPAsync(string cnp)
    {
        return await _context.Clients
            .FirstOrDefaultAsync(c => c.CNP == cnp);
    }

    public async Task<IEnumerable<Client>> GetAllAsync()
    {
        return await _context.Clients.ToListAsync();
    }

    public async Task AddAsync(Client client)
    {
        client.Id = Guid.NewGuid();
        await _context.Clients.AddAsync(client);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Client client)
    {
        _context.Clients.Update(client);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var client = await GetByIdAsync(id);
        if (client != null)
        {
            _context.Clients.Remove(client);
            await _context.SaveChangesAsync();
        }
    }
}

