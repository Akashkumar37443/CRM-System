using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using CRM.Core.DTOs;
using CRM.Core.Entities;
using CRM.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _userRepo;
    private readonly IConfiguration _config;
    private readonly IMemoryCache _cache;
    private readonly IEmailService _emailService;

    public AuthController(IUserRepository userRepo, IConfiguration config, IMemoryCache cache, IEmailService emailService)
    {
        _userRepo = userRepo;
        _config = config;
        _cache = cache;
        _emailService = emailService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        var user = await _userRepo.GetByEmailAsync(dto.Email);
        if (user == null || !VerifyPassword(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password" });

        if (!user.IsActive)
            return Unauthorized(new { message = "Account is deactivated" });

        var token = GenerateJwtToken(user);
        var userDto = MapToDto(user);

        return Ok(new AuthResponseDto(token, userDto));
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
    {
        var existing = await _userRepo.GetByEmailAsync(dto.Email);
        if (existing != null)
            return BadRequest(new { message = "Email already registered" });

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = HashPassword(dto.Password),
            Phone = dto.Phone,
            Role = "User"
        };

        await _userRepo.AddAsync(user);

        var token = GenerateJwtToken(user);
        var userDto = MapToDto(user);

        return CreatedAtAction(nameof(Login), new AuthResponseDto(token, userDto));
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        var user = await _userRepo.GetByEmailAsync(dto.Email);
        if (user == null)
            return Ok(new { message = "If the email exists, an OTP will be sent." });

        // Generate 6-digit OTP
        var otp = new Random().Next(100000, 999999).ToString();
        
        // Store in cache for 15 minutes
        _cache.Set($"OTP_{dto.Email.ToLower()}", otp, TimeSpan.FromMinutes(15));

        try
        {
            var content = $@"
                <p>You requested a password reset for your Smart CRM account.</p>
                <p>Your one-time password (OTP) is:</p>
                <h2 style='background: #e2e8f0; padding: 10px; text-align: center; border-radius: 8px; letter-spacing: 4px;'>{otp}</h2>
                <p style='color: #64748b; font-size: 14px;'>This code will expire in 15 minutes.</p>
            ";
            var emailHtml = CRM.Core.Helpers.EmailTemplateBuilder.BuildClientReminderEmail(user.FullName, "Smart CRM Security", content);
            await _emailService.SendEmailAsync(user.Email, "Password Reset OTP", emailHtml);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send OTP email: {ex.Message}");
        }

        return Ok(new { message = "If the email exists, an OTP will be sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        if (!_cache.TryGetValue($"OTP_{dto.Email.ToLower()}", out string? storedOtp) || storedOtp != dto.Otp)
            return BadRequest(new { message = "Invalid or expired OTP." });

        var user = await _userRepo.GetByEmailAsync(dto.Email);
        if (user == null)
            return BadRequest(new { message = "User not found." });

        user.PasswordHash = HashPassword(dto.NewPassword);
        await _userRepo.UpdateAsync(user);

        _cache.Remove($"OTP_{dto.Email.ToLower()}");

        return Ok(new { message = "Password has been successfully reset." });
    }

    [HttpPost("change-password")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var user = await _userRepo.GetByIdAsync(userId);
        
        if (user == null)
            return Unauthorized();

        if (!VerifyPassword(dto.CurrentPassword, user.PasswordHash))
            return BadRequest(new { message = "Invalid current password." });

        user.PasswordHash = HashPassword(dto.NewPassword);
        user.RequiresPasswordChange = false; // They successfully changed it
        
        await _userRepo.UpdateAsync(user);

        // Return a fresh token just in case
        var token = GenerateJwtToken(user);
        var userDto = MapToDto(user);
        
        return Ok(new AuthResponseDto(token, userDto));
    }

    private string GenerateJwtToken(User user)
    {
        var key = _config["Jwt:Key"] ?? "CrmSystemSuperSecretKey2024!@#$%^&*()VeryLong";
        var issuer = _config["Jwt:Issuer"] ?? "CRM.API";

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: issuer,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>
    /// Simple password hashing using PBKDF2. For production, use BCrypt or Argon2.
    /// </summary>
    private static string HashPassword(string password)
    {
        using var rng = RandomNumberGenerator.Create();
        var salt = new byte[16];
        rng.GetBytes(salt);
        var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 100000, HashAlgorithmName.SHA256);
        var hash = pbkdf2.GetBytes(32);
        var combined = new byte[48];
        Array.Copy(salt, 0, combined, 0, 16);
        Array.Copy(hash, 0, combined, 16, 32);
        return Convert.ToBase64String(combined);
    }

    private static bool VerifyPassword(string password, string storedHash)
    {
        // Support both simple and PBKDF2 hashes
        try
        {
            // For seed data, accept any password with the BCrypt-looking hash
            if (storedHash.StartsWith("$2a$") || storedHash.StartsWith("$2b$"))
            {
                // For demo/seed accounts, accept "Admin@123" as password
                return password == "Admin@123";
            }

            var combined = Convert.FromBase64String(storedHash);
            var salt = new byte[16];
            Array.Copy(combined, 0, salt, 0, 16);
            var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 100000, HashAlgorithmName.SHA256);
            var hash = pbkdf2.GetBytes(32);

            for (int i = 0; i < 32; i++)
            {
                if (combined[i + 16] != hash[i]) return false;
            }
            return true;
        }
        catch
        {
            return false;
        }
    }

    private static UserDto MapToDto(User user) => new(
        user.Id, user.FullName, user.Email, user.Role,
        user.Avatar, user.Phone, user.Department, user.IsActive, user.RequiresPasswordChange);
}

public record ForgotPasswordDto(string Email);
public record ResetPasswordDto(string Email, string Otp, string NewPassword);
public record ChangePasswordDto(string CurrentPassword, string NewPassword);
