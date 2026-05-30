using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using CreditApp.Application.DTOs.CreditRequest;
using CreditApp.Application.Pagination;
using CreditApp.Application.Services.Interfaces;
using CreditApp.Domain.Entities;
using CreditApp.Domain.Enums;
using CreditApp.Domain.Interfaces;

namespace CreditApp.Application.Services;

public class CreditRequestService : ICreditRequestService
{
    private readonly ICreditRequestRepository _creditRequestRepository;
    private readonly IClientRepository _clientRepository;
    private readonly IScoringService _scoringService;

    public CreditRequestService(
        ICreditRequestRepository creditRequestRepository,
        IClientRepository clientRepository,
        IScoringService scoringService)
    {
        _creditRequestRepository = creditRequestRepository;
        _clientRepository = clientRepository;
        _scoringService = scoringService;
    }

    public async Task<CreditRequestDto?> GetByIdAsync(Guid id)
    {
        var creditRequest = await _creditRequestRepository.GetByIdAsync(id);
        return creditRequest == null ? null : MapToDto(creditRequest);
    }

    public async Task<PagedResult<CreditRequestDto>> GetPagedAsync(PageRequest request)
    {
        var (items, totalCount) = await _creditRequestRepository.GetPagedAsync(request.Page, request.PageSize, request.Search);
        return new PagedResult<CreditRequestDto>
        {
            Items = items.Select(MapToDto).ToList(),
            Page = request.Page,
            PageSize = request.PageSize,
            TotalCount = totalCount,
        };
    }

    public async Task<IEnumerable<CreditRequestDto>> GetByClientIdAsync(Guid clientId)
    {
        var creditRequests = await _creditRequestRepository.GetByClientIdAsync(clientId);
        return creditRequests.Select(MapToDto);
    }

    public async Task <CreditRequestDto> CreateAsync(CreateCreditRequestDto dto)
    {
        var client = await _clientRepository.GetByIdAsync(dto.ClientId);
        if (client == null)
            throw new InvalidOperationException("Clientul nu a fost găsit.");

        int score = _scoringService.CalculateScore(client, dto.Amount, dto.TermMonths);
        string riskLevel = _scoringService.DetermineRiskLevel(score);

        var creditRequest = new CreditRequest
        {
            ClientId = dto.ClientId,
            Amount = dto.Amount,
            TermMonths = dto.TermMonths,
            Purpose = dto.Purpose,
            Status = CreditStatus.Pending,
            CreditScore = score,
            RiskLevel = Enum.Parse<RiskLevel>(riskLevel)
        };

        await _creditRequestRepository.AddAsync(creditRequest);
        return MapToDto(creditRequest);
    }

    public async Task UpdateStatusAsync(Guid id, string status)
    {
        var creditRequest = await _creditRequestRepository.GetByIdAsync(id);
        if (creditRequest == null)
            throw new InvalidOperationException("Cererea de credit nu a fost gasită.");

        if (!Enum.TryParse<CreditStatus>(status, out var parsedStatus))
            throw new InvalidOperationException($"Statusul '{status}' nu este valid.");

        creditRequest.Status = parsedStatus;
        await _creditRequestRepository.UpdateAsync(creditRequest);
    }

    private static CreditRequestDto MapToDto(CreditRequest cr) => new()
    {
        Id = cr.Id,
        ClientId = cr.ClientId,
        ClientFullName = cr.Client != null
            ? $"{cr.Client.FirstName} {cr.Client.LastName}"
            : string.Empty,
        AssignedAnalystId = cr.AssignedAnalystId,
        AssignedAnalystName = cr.AssignedAnalyst != null
            ? $"{cr.AssignedAnalyst.FirstName} {cr.AssignedAnalyst.LastName}"
            : null,
        Amount = cr.Amount,
        TermMonths = cr.TermMonths,
        Purpose = cr.Purpose,
        Status = cr.Status.ToString(),
        CreditScore = cr.CreditScore,
        RiskLevel = cr.RiskLevel.ToString(),
        CreatedAt = cr.CreatedAt,
        UpdatedAt = cr.UpdatedAt
    };
 }
