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
    private readonly IEmailService _emailService;
    private readonly IConfiguration _config;

    public UsersController(IUserRepository userRepo, IEmailService emailService, IConfiguration config)
    {
        _userRepo = userRepo;
        _emailService = emailService;
        _config = config;
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

    // POST /api/users — Admin only
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        var existing = await _userRepo.GetByEmailAsync(dto.Email);
        if (existing != null)
            return BadRequest(new { message = "Email already registered" });

        var tempPassword = "ChangeMe" + new Random().Next(1000, 9999) + "!";
        
        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = HashPassword(tempPassword), // Helper method needed or injected
            Phone = dto.Phone,
            Department = dto.Department,
            Role = dto.Role ?? "User",
            IsActive = true
        };

        await _userRepo.AddAsync(user);

        // Send Welcome Email
        try
        {
            var loginUrl = "http://localhost:5173/login"; // Can be pulled from config
            var emailHtml = CRM.Core.Helpers.EmailTemplateBuilder.BuildWelcomeEmail(user.FullName, user.Email, tempPassword, loginUrl);
            await _emailService.SendEmailAsync(user.Email, "Welcome to Smart CRM Platform", emailHtml);
        }
        catch (Exception ex)
        {
            // Log error but don't fail the user creation
            Console.WriteLine($"Failed to send welcome email: {ex.Message}");
        }

        return CreatedAtAction(nameof(GetMe), new { id = user.Id }, MapToDto(user));
    }
    
    // HashPassword helper (duplicated from AuthController for simplicity here, ideally shared in a service)
    private static string HashPassword(string password)
    {
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        var salt = new byte[16];
        rng.GetBytes(salt);
        var pbkdf2 = new System.Security.Cryptography.Rfc2898DeriveBytes(password, salt, 100000, System.Security.Cryptography.HashAlgorithmName.SHA256);
        var hash = pbkdf2.GetBytes(32);
        var combined = new byte[48];
        Array.Copy(salt, 0, combined, 0, 16);
        Array.Copy(hash, 0, combined, 16, 32);
        return Convert.ToBase64String(combined);
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
public record CreateUserDto(string FullName, string Email, string? Phone, string? Department, string? Role);
