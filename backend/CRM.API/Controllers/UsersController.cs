using CRM.Core.DTOs;
using CRM.Core.Entities;
using CRM.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepo;

    public UsersController(IUserRepository userRepo)
    {
        _userRepo = userRepo;
    }

    // GET /api/users — Admin only
    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        var users = await _userRepo.GetAllAsync();
        return Ok(users.Select(u => MapToDto(u)));
    }

    // GET /api/users/me — current user profile
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetMe()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(idClaim, out var userId))
            return Unauthorized();

        var user = await _userRepo.GetByIdAsync(userId);
        if (user == null) return NotFound();
        return Ok(MapToDto(user));
    }

    // PUT /api/users/{id}/role — Admin only
    [HttpPut("{id}/role")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleDto dto)
    {
        var user = await _userRepo.GetByIdAsync(id);
        if (user == null) return NotFound();

        user.Role = dto.Role;
        await _userRepo.UpdateAsync(user);
        return Ok(MapToDto(user));
    }

    // PUT /api/users/{id}/status — Admin only
    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        var user = await _userRepo.GetByIdAsync(id);
        if (user == null) return NotFound();

        user.IsActive = dto.IsActive;
        await _userRepo.UpdateAsync(user);
        return Ok(MapToDto(user));
    }

    // DELETE /api/users/{id} — Admin only
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(idClaim, out var currentUserId) && currentUserId == id)
            return BadRequest(new { message = "Cannot delete your own account" });

        var user = await _userRepo.GetByIdAsync(id);
        if (user == null) return NotFound();
        await _userRepo.DeleteAsync(id);
        return NoContent();
    }

    private static UserDto MapToDto(User u) =>
        new(u.Id, u.FullName, u.Email, u.Role, u.Avatar, u.Phone, u.Department, u.IsActive);
}

public record UpdateRoleDto(string Role);
public record UpdateStatusDto(bool IsActive);
