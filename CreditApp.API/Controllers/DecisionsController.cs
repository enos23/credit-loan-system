using CreditApp.Application.DTOs.Decision;
using CreditApp.Application.Services.Interfaces;
using CreditApp.Domain.Entities;
using CreditApp.Domain.Enums;
using CreditApp.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Runtime.CompilerServices;

namespace CreditApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DecisionsController : ControllerBase
{
    private readonly IDecisionRepository _decisionRepository;
    private readonly ICreditRequestRepository _creditRequestRepository;

    public DecisionsController(
        IDecisionRepository decisionRepository,
        ICreditRequestRepository creditRequestRepository)
    {
        _decisionRepository = decisionRepository;
        _creditRequestRepository = creditRequestRepository;
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Analyst,Banker")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var decision = await _decisionRepository.GetByIdAsync(id);
        if (decision == null) 
            return NotFound("Decizia nu a fost găsită.");

        return Ok(MapToDto(decision));
    }

    [HttpGet("credit-request/{creditRequestId:guid}")]
    [Authorize(Roles = "Admin,Analyst,Banker")]
    public async Task<IActionResult> GetByCreditRequestId(Guid creditRequestId)
    {
        var decision = await _decisionRepository.GetByCreditRequestIdAsync(creditRequestId);
        if (decision == null)
            return NotFound("Decizia nu a fost găsită.");

        return Ok(MapToDto(decision));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Analyst")]
    public async Task<IActionResult> Create([FromBody] CreateDecisionDto dto)
    {
        try
        {
            var creditRequest = await _creditRequestRepository.GetByIdAsync(dto.CreditRequestId);
            if (creditRequest == null)
                return NotFound("Cererea de credit nu a fost găsită.");

            var analystId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (analystId == null)
                return Unauthorized();

            var decision = new Decision
            {
                CreditRequestId = dto.CreditRequestId,
                AnalystId = Guid.Parse(analystId),
                DecisionType = Enum.Parse<DecisionType>(dto.DecisionType),
                InterestRate = dto.InterestRate,
                ApprovedAmount = dto.ApprovedAmount,
                Notes = dto.Notes,
            };

            await _decisionRepository.AddAsync(decision);

            creditRequest.Status = decision.DecisionType == DecisionType.Approved
                ? CreditStatus.Approved
                : decision.DecisionType == DecisionType.Rejected
                    ? CreditStatus.Rejected
                    : CreditStatus.Pending;

            await _creditRequestRepository.UpdateAsync(creditRequest);

            return CreatedAtAction(nameof(GetById), new { id = decision.Id }, MapToDto(decision));
        }
        catch  (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
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
