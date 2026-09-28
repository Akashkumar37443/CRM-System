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
public class DealsController : ControllerBase
{
    private readonly IDealRepository _dealRepo;
    private readonly IActivityRepository _activityRepo;

    public DealsController(IDealRepository dealRepo, IActivityRepository activityRepo)
    {
        _dealRepo = dealRepo;
        _activityRepo = activityRepo;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DealDto>>> GetAll([FromQuery] string? stage)
    {
        var deals = string.IsNullOrEmpty(stage)
            ? await _dealRepo.GetAllAsync()
            : await _dealRepo.GetByStageAsync(stage);

        return Ok(deals.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DealDto>> GetById(int id)
    {
        var deal = await _dealRepo.GetByIdAsync(id);
        if (deal == null) return NotFound();
        return Ok(MapToDto(deal));
    }

    [HttpPost]
    public async Task<ActionResult<DealDto>> Create([FromBody] CreateDealDto dto)
    {
        var userId = GetCurrentUserId();
        var deal = new Deal
        {
            Title = dto.Title, Value = dto.Value,
            Stage = dto.Stage ?? "Lead", Probability = dto.Probability ?? 10,
            Description = dto.Description, Priority = dto.Priority ?? "Medium",
            ExpectedCloseDate = dto.ExpectedCloseDate,
            ContactId = dto.ContactId, CompanyId = dto.CompanyId, OwnerId = userId
        };

        await _dealRepo.AddAsync(deal);

        await _activityRepo.AddAsync(new Activity
        {
            Type = "Created",
            Description = $"Created deal: {deal.Title} (${deal.Value:N0})",
            EntityType = "Deal", EntityId = deal.Id, UserId = userId
        });

        var created = await _dealRepo.GetByIdAsync(deal.Id);
        return CreatedAtAction(nameof(GetById), new { id = deal.Id }, MapToDto(created!));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<DealDto>> Update(int id, [FromBody] UpdateDealDto dto)
    {
        var deal = await _dealRepo.GetByIdAsync(id);
        if (deal == null) return NotFound();

        var oldStage = deal.Stage;

        if (dto.Title != null) deal.Title = dto.Title;
        if (dto.Value.HasValue) deal.Value = dto.Value.Value;
        if (dto.Stage != null) deal.Stage = dto.Stage;
        if (dto.Probability.HasValue) deal.Probability = dto.Probability.Value;
        if (dto.Description != null) deal.Description = dto.Description;
        if (dto.Priority != null) deal.Priority = dto.Priority;
        if (dto.ExpectedCloseDate.HasValue) deal.ExpectedCloseDate = dto.ExpectedCloseDate;
        if (dto.ActualCloseDate.HasValue) deal.ActualCloseDate = dto.ActualCloseDate;
        if (dto.ContactId.HasValue) deal.ContactId = dto.ContactId;
        if (dto.CompanyId.HasValue) deal.CompanyId = dto.CompanyId;

        await _dealRepo.UpdateAsync(deal);

        // Log stage change
        if (dto.Stage != null && dto.Stage != oldStage)
        {
            await _activityRepo.AddAsync(new Activity
            {
                Type = "DealStageChanged",
                Description = $"Deal '{deal.Title}' moved from {oldStage} to {dto.Stage}",
                EntityType = "Deal", EntityId = deal.Id, UserId = GetCurrentUserId()
            });
        }

        var updated = await _dealRepo.GetByIdAsync(id);
        return Ok(MapToDto(updated!));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var deal = await _dealRepo.GetByIdAsync(id);
        if (deal == null) return NotFound();
        await _dealRepo.DeleteAsync(id);
        return NoContent();
    }

    [HttpGet("{id}/health")]
    public async Task<ActionResult<DealHealthDto>> GetDealHealth(int id)
    {
        var deal = await _dealRepo.GetByIdAsync(id);
        if (deal == null) return NotFound();

        var activities = await _activityRepo.GetByEntityAsync("Deal", id);
        var lastActivity = activities.OrderByDescending(a => a.CreatedAt).FirstOrDefault();
        var lastActivityDate = lastActivity?.CreatedAt;

        // Also check task overdues. Need tasks for this deal.
        var dealWithTasks = (await _dealRepo.GetActiveDealsWithDetailsAsync()).FirstOrDefault(d => d.Id == id);
        int overdueTasks = dealWithTasks?.Tasks.Count(t => t.Status != "Completed" && t.DueDate < DateTime.UtcNow) ?? 0;

        var health = CRM.API.Services.DealHealthService.ComputeHealth(deal, lastActivityDate, overdueTasks);
        return Ok(health);
    }

    [HttpGet("health-report")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<DealHealthDto>>> GetHealthReport()
    {
        var activeDeals = await _dealRepo.GetActiveDealsWithDetailsAsync();
        var results = new List<DealHealthDto>();

        foreach (var deal in activeDeals)
        {
            var lastActivity = deal.Activities.OrderByDescending(a => a.CreatedAt).FirstOrDefault();
            int overdueTasks = deal.Tasks.Count(t => t.Status != "Completed" && t.DueDate < DateTime.UtcNow);
            var health = CRM.API.Services.DealHealthService.ComputeHealth(deal, lastActivity?.CreatedAt, overdueTasks);
            results.Add(health);
        }

        return Ok(results.OrderBy(h => h.HealthScore).ThenByDescending(h => h.Value).ToList());
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null ? int.Parse(claim.Value) : 1;
    }

    private static DealDto MapToDto(Deal d) => new(
        d.Id, d.Title, d.Value, d.Stage, d.Probability,
        d.Description, d.Priority, d.ExpectedCloseDate,
        d.ActualCloseDate, d.CreatedAt,
        d.ContactId, d.Contact != null ? $"{d.Contact.FirstName} {d.Contact.LastName}" : null,
        d.CompanyId, d.Company?.Name, d.OwnerId, d.Owner?.FullName);
}
