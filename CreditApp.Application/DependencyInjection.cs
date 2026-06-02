using CreditApp.Application.Chat;
using CreditApp.Application.Chat.Tools;
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
        services.AddScoped<IDecisionService, DecisionService>();
        services.AddScoped<IScoringService, ScoringService>();
        services.AddScoped<IUserManagementService, UserManagementService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<ITransactionService, TransactionService>();

        // Chat tools. The ChatService injects IEnumerable<IChatTool> and filters by user role.
        services.AddScoped<IChatTool, GetClientTool>();
        services.AddScoped<IChatTool, ListClientsTool>();
        services.AddScoped<IChatTool, GetCreditRequestTool>();
        services.AddScoped<IChatTool, ListCreditRequestsTool>();
        services.AddScoped<IChatTool, GetDashboardStatsTool>();
        services.AddScoped<IChatTool, GetDecisionTool>();
        services.AddScoped<IChatTool, ListTransactionsTool>();

        services.AddScoped<IChatService, ChatService>();

        return services;
    }
}
