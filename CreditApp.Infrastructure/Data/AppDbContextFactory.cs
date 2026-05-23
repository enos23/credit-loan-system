using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace CreditApp.Infrastructure.Data;

// Used only by EF tools (migrations, scaffolding) so the design-time bootstrap
// doesn't drag in the API project's runtime startup guards.
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var basePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "CreditApp.API");

        var config = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddUserSecrets("creditapp-api-d7a4c2e1")
            .AddEnvironmentVariables()
            .Build();

        // Real connection strings come from user secrets / env vars; falling back to a
        // placeholder is safe because `migrations add` and `migrations script` don't connect.
        var connectionString = config.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
            connectionString = "Host=localhost;Database=creditapp_design_time;Username=postgres;Password=postgres";

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        return new AppDbContext(options);
    }
}
