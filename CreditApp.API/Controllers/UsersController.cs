using CreditApp.Application.DTOs.Users;
using CreditApp.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CreditApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IUserManagementService _userManagementService;

    public UsersController(IUserManagementService userManagementService)
    {
        _userManagementService = userManagementService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userManagementService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
    {
        try
        {
            var user = await _userManagementService.CreateUserAsync(dto);
            return Ok(user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserDto dto)
    {
        try
        {
            var user = await _userManagementService.UpdateUserAsync(id, dto);
            if (user == null) return NotFound();
            return Ok(user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPatch("{id}/toggle-active")]
    public async Task<IActionResult> ToggleActive(Guid id)
    {
        var isActive = await _userManagementService.ToggleActiveAsync(id);
        return Ok(new { isActive });
    }
}
