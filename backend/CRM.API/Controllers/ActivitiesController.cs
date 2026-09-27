using CRM.Core.DTOs;
using CRM.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ActivitiesController : ControllerBase
{
    private readonly IActivityRepository _activityRepo;

    public ActivitiesController(IActivityRepository activityRepo)
    {
        _activityRepo = activityRepo;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ActivityDto>>> GetRecent([FromQuery] int count = 20)
    {
        var activities = await _activityRepo.GetRecentAsync(count);
        return Ok(activities.Select(a => new ActivityDto(
            a.Id, a.Type, a.Description, a.EntityType,
            a.EntityId, a.CreatedAt, a.UserId, a.User?.FullName,
            a.Outcome, a.Channel)));
    }

    [HttpGet("{entityType}/{entityId}")]
    public async Task<ActionResult<IEnumerable<ActivityDto>>> GetByEntity(string entityType, int entityId)
    {
        var activities = await _activityRepo.GetByEntityAsync(entityType, entityId);
        return Ok(activities.Select(a => new ActivityDto(
            a.Id, a.Type, a.Description, a.EntityType,
            a.EntityId, a.CreatedAt, a.UserId, a.User?.FullName,
            a.Outcome, a.Channel)));
    }
}
