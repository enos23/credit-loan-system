using CreditApp.Application.DTOs.Decision;
using CreditApp.Application.Exceptions;
using CreditApp.Application.Services.Interfaces;
using CreditApp.Domain.Entities;
using CreditApp.Domain.Enums;
using CreditApp.Domain.Interfaces;

namespace CreditApp.Application.Services;

public class DecisionService : IDecisionService
{
    private readonly IDecisionRepository _decisionRepository;
    private readonly ICreditRequestRepository _creditRequestRepository;

    public DecisionService(
        IDecisionRepository decisionRepository,
        ICreditRequestRepository creditRequestRepository)
    {
        _decisionRepository = decisionRepository;
        _creditRequestRepository = creditRequestRepository;
    }

    public async Task<DecisionDto?> GetByIdAsync(Guid id)
    {
        var decision = await _decisionRepository.GetByIdAsync(id);
        return decision == null ? null : MapToDto(decision);
    }

    public async Task<DecisionDto?> GetByCreditRequestIdAsync(Guid creditRequestId)
    {
        var decision = await _decisionRepository.GetByCreditRequestIdAsync(creditRequestId);
        return decision == null ? null : MapToDto(decision);
    }

    public async Task<DecisionDto> CreateAsync(CreateDecisionDto dto, Guid analystId)
    {
        var creditRequest = await _creditRequestRepository.GetByIdAsync(dto.CreditRequestId);
        if (creditRequest == null)
            throw new NotFoundException("Cererea de credit nu a fost găsită.");

        var existingDecision = await _decisionRepository.GetByCreditRequestIdAsync(dto.CreditRequestId);
        if (existingDecision != null)
            throw new ConflictException("Există deja o decizie pentru această cerere de credit.");

        if (!Enum.TryParse<DecisionType>(dto.DecisionType, out var decisionType))
            throw new InvalidOperationException($"Tipul de decizie '{dto.DecisionType}' nu este valid.");

        var decision = new Decision
        {
            CreditRequestId = dto.CreditRequestId,
            AnalystId = analystId,
            DecisionType = decisionType,
            InterestRate = dto.InterestRate,
            ApprovedAmount = dto.ApprovedAmount,
            Notes = dto.Notes,
        };

        await _decisionRepository.AddAsync(decision);

        creditRequest.Status = decisionType switch
        {
            DecisionType.Approved => CreditStatus.Approved,
            DecisionType.Rejected => CreditStatus.Rejected,
            _ => CreditStatus.Pending,
        };
        await _creditRequestRepository.UpdateAsync(creditRequest);

        return MapToDto(decision);
    }

    private static DecisionDto MapToDto(Decision decision) => new()
    {
        Id = decision.Id,
        CreditRequestId = decision.CreditRequestId,
        AnalystFullName = decision.Analyst != null
            ? $"{decision.Analyst.FirstName} {decision.Analyst.LastName}"
            : string.Empty,
        DecisionType = decision.DecisionType.ToString(),
        InterestRate = decision.InterestRate,
        ApprovedAmount = decision.ApprovedAmount,
        Notes = decision.Notes,
        CreatedAt = decision.CreatedAt
    };
}
