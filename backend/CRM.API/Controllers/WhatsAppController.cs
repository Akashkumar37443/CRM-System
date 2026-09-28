using CRM.Core.DTOs;
using CRM.Core.Entities;
using CRM.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CRM.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class WhatsAppController : ControllerBase
{
    private readonly IActivityRepository _activityRepo;

    public WhatsAppController(IActivityRepository activityRepo)
    {
        _activityRepo = activityRepo;
    }

    [HttpPost("log")]
    public async Task<ActionResult<ActivityDto>> LogWhatsApp([FromBody] LogWhatsAppDto dto)
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(idClaim, out var userId))
            return Unauthorized();

        if (dto.ContactId == null && dto.DealId == null)
            return BadRequest(new { message = "Must provide either ContactId or DealId." });

        var activity = new Activity
        {
            Type = "WhatsApp",
            Channel = "WhatsApp",
            Description = dto.Summary,
            Outcome = dto.Outcome,
            EntityType = dto.DealId != null ? "Deal" : "Contact",
            EntityId = dto.DealId ?? dto.ContactId!.Value,
            UserId = userId,
            ContactId = dto.ContactId,
            DealId = dto.DealId,
            CreatedAt = dto.OccurredAt ?? DateTime.UtcNow
        };

        await _activityRepo.AddAsync(activity);

        // Fetch again to get user details
        var savedActivities = await _activityRepo.GetByEntityAsync(activity.EntityType, activity.EntityId);
        var savedActivity = savedActivities.FirstOrDefault(a => a.Id == activity.Id);
        var uName = savedActivity?.User?.FullName ?? "";

        var resultDto = new ActivityDto(
            activity.Id, activity.Type, activity.Description, activity.EntityType,
            activity.EntityId, activity.CreatedAt, activity.UserId, uName,
            activity.Outcome, activity.Channel);

        return Ok(resultDto);
    }
}
