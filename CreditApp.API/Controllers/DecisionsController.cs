using System.Security.Claims;
using CreditApp.Application.DTOs.Decision;
using CreditApp.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CreditApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DecisionsController : ControllerBase
{
    private readonly IDecisionService _decisionService;

    public DecisionsController(IDecisionService decisionService)
    {
        _decisionService = decisionService;
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Analyst,Banker")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var decision = await _decisionService.GetByIdAsync(id);
        if (decision == null)
            return NotFound("Decizia nu a fost găsită.");

        return Ok(decision);
    }

    [HttpGet("credit-request/{creditRequestId:guid}")]
    [Authorize(Roles = "Admin,Analyst,Banker")]
    public async Task<IActionResult> GetByCreditRequestId(Guid creditRequestId)
    {
        var decision = await _decisionService.GetByCreditRequestIdAsync(creditRequestId);
        if (decision == null)
            return NotFound("Decizia nu a fost găsită.");

        return Ok(decision);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Analyst")]
    public async Task<IActionResult> Create([FromBody] CreateDecisionDto dto)
    {
        var analystIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(analystIdClaim, out var analystId))
            return Unauthorized();

        var decision = await _decisionService.CreateAsync(dto, analystId);
        return CreatedAtAction(nameof(GetById), new { id = decision.Id }, decision);
    }
}
