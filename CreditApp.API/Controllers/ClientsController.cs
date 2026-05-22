using CreditApp.Application.DTOs.Client;
using CreditApp.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CreditApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientsController : ControllerBase
{
    private readonly IClientService _clientService;

    public ClientsController(IClientService clientService)
    {
        _clientService = clientService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Analyst,Banker")]
    public async Task<IActionResult> GetAll()
    {
        var clients = await _clientService.GetAllAsync();
        return Ok(clients);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Analyst,Banker")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var client = await _clientService.GetByAsyncId(id);
        if (client == null)
            return NotFound("Clientul nu a fost găsit.");

        return Ok(client);
    }

    [HttpGet("cnp/{cnp}")]
    [Authorize(Roles = "Admin,Analyst,Banker")]
    public async Task<IActionResult> GetByCNP(string cnp)
    {
        var client = await _clientService.GetByCNPAsync(cnp);
        if (client == null) 
            return NotFound("Clientul nu a fost găsit.");

        return Ok(client);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Analyst,Banker")]
    public async Task<IActionResult> Create([FromBody] CreateClientDto dto)
    {
        try
        {
            var client = await _clientService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = client.Id }, client);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id:guid}")]
    [Authorize(Roles = "Admin,Analyst,Banker")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateClientDto dto)
    {
        try
        {
            await _clientService.UpdateAsync(id, dto);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _clientService.DeleteAsync(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
