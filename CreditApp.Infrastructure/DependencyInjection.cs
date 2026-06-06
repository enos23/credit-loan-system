using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using CreditApp.Application.Chat;
using CreditApp.Application.Configuration;
using CreditApp.Application.Email;
using CreditApp.Application.Interfaces.Queries;
using CreditApp.Domain.Interfaces;
using CreditApp.Infrastructure.Anthropic;
using CreditApp.Infrastructure.Data;
using CreditApp.Infrastructure.Email;
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
        services.AddScoped<IUserPreferenceRepository, UserPreferenceRepository>();

        services.AddScoped<IDashboardQueries, DashboardQueries>();
        services.AddScoped<IReportsQueries, ReportsQueries>();

        // IEmailService implementation depends on transport:
        //  - Resend HTTPS REST API for cloud hosts that block outbound SMTP (Render free tier)
        //  - SMTP for local dev with MailHog and any environment where SMTP is reachable
        var emailSettings = configuration.GetSection("Email").Get<EmailSettings>() ?? new EmailSettings();
        if (emailSettings.UseResendApi)
        {
            services.AddHttpClient<IEmailService, ResendEmailService>(client =>
            {
                client.Timeout = TimeSpan.FromSeconds(30);
            });
        }
        else
        {
            // Singleton: SmtpEmailService holds no state and creates a fresh SmtpClient
            // per call; safe to share across the app.
            services.AddSingleton<IEmailService, SmtpEmailService>();
        }

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