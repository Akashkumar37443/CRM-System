using CRM.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestEmailController : ControllerBase
{
    private readonly IEmailService _emailService;

    public TestEmailController(IEmailService emailService)
    {
        _emailService = emailService;
    }

    [AllowAnonymous]
    [HttpGet("send")]
    public async Task<IActionResult> SendTestEmail([FromQuery] string to)
    {
        try
        {
            await _emailService.SendEmailAsync(
                to, 
                "Smart CRM Test Email", 
                "<h1>Success!</h1><p>Your EmailService is perfectly configured and working in the Smart CRM Application.</p>"
            );
            return Ok(new { message = $"Test email successfully sent to {to}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, details = ex.InnerException?.Message });
        }
    }
}
