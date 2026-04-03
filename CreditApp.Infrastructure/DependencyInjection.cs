using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using CreditApp.Domain.Interfaces;
using CreditApp.Infrastructure.Data;
using CreditApp.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CreditApp.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IClientRepository, ClientRepository>();
        services.AddScoped<ICreditRequestRepository, CreditRequestRepository>();
        services.AddScoped<IDecisionRepository, DecisionRepository>();
        services.AddScoped<IUserRepository, UserRepository>();

        return services;
    }
}