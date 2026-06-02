using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using CreditApp.Application.Chat;
using CreditApp.Application.Configuration;
using CreditApp.Application.Interfaces.Queries;
using CreditApp.Domain.Interfaces;
using CreditApp.Infrastructure.Anthropic;
using CreditApp.Infrastructure.Data;
using CreditApp.Infrastructure.Queries;
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

        services.AddScoped<IDashboardQueries, DashboardQueries>();

        // Anthropic API client. The HttpClient is configured once at registration
        // so callers don't have to set headers/base address on each request.
        services.AddHttpClient<IAnthropicClient, AnthropicClient>((sp, client) =>
        {
            var settings = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<AnthropicSettings>>().Value;
            client.BaseAddress = new Uri(settings.BaseUrl);
            client.DefaultRequestHeaders.Add("x-api-key", settings.ApiKey);
            client.DefaultRequestHeaders.Add("anthropic-version", settings.AnthropicVersion);
            client.Timeout = TimeSpan.FromSeconds(60);
        });

        return services;
    }
}