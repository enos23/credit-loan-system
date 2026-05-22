using CreditApp.Application.DTOs.Dashboard;

namespace CreditApp.Application.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardDto> GetDashboardAsync();
}
