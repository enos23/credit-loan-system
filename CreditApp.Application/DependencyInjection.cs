using CreditApp.Application.Services.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

using CreditApp.Application.Services;
using CreditApp.Application.Services.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace CreditApp.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(
        this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IClientService, ClientService>();
        services.AddScoped<ICreditRequestService, CreditRequestService>();
        services.AddScoped<IScoringService, ScoringService>();
    
    return services;
    }
}
