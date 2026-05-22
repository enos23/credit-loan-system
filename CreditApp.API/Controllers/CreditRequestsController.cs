using CreditApp.Application.DTOs.CreditRequest;
using CreditApp.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CreditApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]

public class CreditRequestsController : ControllerBase
{
    private readonly ICreditRequestService _creditRequestService;

    public CreditRequestsController(ICreditRequestService creditRequestService)
    {
        _creditRequestService = creditRequestService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Analyst,Banker")]
    public async Task<IActionResult> GetAll()
    {
        var requests = await _creditRequestService.GetAllAsync();
        return Ok(requests);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Analyst,Banker")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var request = await _creditRequestService.GetByIdAsync(id);
        if (request == null)
            return NotFound("Cererea de credit nu a fost găsită.");

        return Ok(request);
    }

    [HttpGet("client/{clientId:guid}")]
    [Authorize(Roles = "Admin,Analyst,Banker")]
    public async Task<IActionResult> GetByClientId(Guid clientId)
    {
        var requests = await _creditRequestService.GetByClientIdAsync(clientId);
        return Ok(requests);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Analyst,Banker")]
    public async Task<IActionResult> Create([FromBody] CreateCreditRequestDto dto)
    {
        try
        {
            var request = await _creditRequestService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = request.Id }, request);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin,Analyst")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateCreditRequestStatusDto dto)
    {
        try
        {
            await _creditRequestService.UpdateStatusAsync(id, dto.Status);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
