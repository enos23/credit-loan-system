using CreditApp.Application.DTOs.Reports;

namespace CreditApp.Application.Services.Interfaces;

public interface IReportsService
{
    Task<ReportsDto> GetReportsAsync();
}
