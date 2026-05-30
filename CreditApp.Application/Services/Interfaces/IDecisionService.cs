using CreditApp.Application.DTOs.Decision;

namespace CreditApp.Application.Services.Interfaces;

public interface IDecisionService
{
    Task<DecisionDto?> GetByIdAsync(Guid id);
    Task<DecisionDto?> GetByCreditRequestIdAsync(Guid creditRequestId);
    Task<DecisionDto> CreateAsync(CreateDecisionDto dto, Guid analystId);
}
