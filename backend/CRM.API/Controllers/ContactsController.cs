using System.Security.Claims;
using CRM.Core.DTOs;
using CRM.Core.Entities;
using CRM.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ContactsController : ControllerBase
{
    private readonly IContactRepository _contactRepo;
    private readonly IActivityRepository _activityRepo;
    private readonly IEmailService _emailService;

    public ContactsController(IContactRepository contactRepo, IActivityRepository activityRepo, IEmailService emailService)
    {
        _contactRepo = contactRepo;
        _activityRepo = activityRepo;
        _emailService = emailService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ContactDto>>> GetAll([FromQuery] string? search)
    {
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "User";
        var userId = GetCurrentUserId();
        bool isPrivileged = role == "Admin" || role == "Manager";

        IEnumerable<Contact> contacts;
        if (string.IsNullOrEmpty(search))
            contacts = isPrivileged ? await _contactRepo.GetAllAsync() : await _contactRepo.GetByOwnerAsync(userId);
        else
            contacts = await _contactRepo.SearchAsync(search);

        // Non-privileged: filter search results to own contacts only
        if (!isPrivileged && !string.IsNullOrEmpty(search))
            contacts = contacts.Where(c => c.OwnerId == userId);

        return Ok(contacts.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ContactDto>> GetById(int id)
    {
        var contact = await _contactRepo.GetByIdAsync(id);
        if (contact == null) return NotFound();
        return Ok(MapToDto(contact));
    }

    [HttpGet("company/{companyId}")]
    public async Task<ActionResult<IEnumerable<ContactDto>>> GetByCompany(int companyId)
    {
        var contacts = await _contactRepo.GetByCompanyAsync(companyId);
        return Ok(contacts.Select(MapToDto));
    }

    [HttpPost]
    public async Task<ActionResult<ContactDto>> Create([FromBody] CreateContactDto dto)
    {
        var userId = GetCurrentUserId();
        var contact = new Contact
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            JobTitle = dto.JobTitle,
            Avatar = dto.Avatar,
            Status = dto.Status ?? "Active",
            Notes = dto.Notes,
            Address = dto.Address,
            City = dto.City,
            Country = dto.Country,
            CompanyId = dto.CompanyId,
            OwnerId = userId
        };

        await _contactRepo.AddAsync(contact);

        await _activityRepo.AddAsync(new Activity
        {
            Type = "Created",
            Description = $"Created contact: {contact.FirstName} {contact.LastName}",
            EntityType = "Contact",
            EntityId = contact.Id,
            UserId = userId,
            ContactId = contact.Id
        });

        var created = await _contactRepo.GetByIdAsync(contact.Id);
        return CreatedAtAction(nameof(GetById), new { id = contact.Id }, MapToDto(created!));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ContactDto>> Update(int id, [FromBody] UpdateContactDto dto)
    {
        var contact = await _contactRepo.GetByIdAsync(id);
        if (contact == null) return NotFound();

        if (dto.FirstName != null) contact.FirstName = dto.FirstName;
        if (dto.LastName != null) contact.LastName = dto.LastName;
        if (dto.Email != null) contact.Email = dto.Email;
        if (dto.Phone != null) contact.Phone = dto.Phone;
        if (dto.JobTitle != null) contact.JobTitle = dto.JobTitle;
        if (dto.Avatar != null) contact.Avatar = dto.Avatar;
        if (dto.Status != null) contact.Status = dto.Status;
        if (dto.Notes != null) contact.Notes = dto.Notes;
        if (dto.Address != null) contact.Address = dto.Address;
        if (dto.City != null) contact.City = dto.City;
        if (dto.Country != null) contact.Country = dto.Country;
        if (dto.CompanyId.HasValue) contact.CompanyId = dto.CompanyId;

        await _contactRepo.UpdateAsync(contact);

        var updated = await _contactRepo.GetByIdAsync(id);
        return Ok(MapToDto(updated!));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "User";
        var userId = GetCurrentUserId();
        var contact = await _contactRepo.GetByIdAsync(id);
        if (contact == null) return NotFound();
        // Users can only delete their own contacts
        if (role == "User" && contact.OwnerId != userId)
            return Forbid();
        await _contactRepo.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost("{id}/send-email")]
    public async Task<IActionResult> SendEmail(int id, [FromBody] SendEmailDto dto)
    {
        var contact = await _contactRepo.GetByIdAsync(id);
        if (contact == null) return NotFound();

        var senderName = User.FindFirst(ClaimTypes.Name)?.Value ?? "Your Account Manager";

        try
        {
            var emailHtml = CRM.Core.Helpers.EmailTemplateBuilder.BuildClientReminderEmail(contact.FirstName, senderName, dto.Message);
            await _emailService.SendEmailAsync(contact.Email, dto.Subject, emailHtml);
            
            // Log it as an activity
            await _activityRepo.AddAsync(new Activity
            {
                Type = "Email",
                Description = $"Sent email: {dto.Subject}",
                ContactId = id,
                UserId = GetCurrentUserId()
            });

            return Ok(new { message = "Email sent successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Failed to send email", details = ex.Message });
        }
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null ? int.Parse(claim.Value) : 1;
    }

    private static ContactDto MapToDto(Contact c) => new(
        c.Id, c.FirstName, c.LastName, c.Email, c.Phone,
        c.JobTitle, c.Avatar, c.Status, c.Notes,
        c.Address, c.City, c.Country,
        c.CreatedAt, c.LastContactedAt,
        c.CompanyId, c.Company?.Name, c.OwnerId, c.Owner?.FullName);
}

public record SendEmailDto(string Subject, string Message);
