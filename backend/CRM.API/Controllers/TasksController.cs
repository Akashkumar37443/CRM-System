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
public class TasksController : ControllerBase
{
    private readonly ICrmTaskRepository _taskRepo;

    public TasksController(ICrmTaskRepository taskRepo)
    {
        _taskRepo = taskRepo;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CrmTaskDto>>> GetAll()
    {
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "User";
        var userId = GetCurrentUserId();
        bool isPrivileged = role == "Admin" || role == "Manager";

        var tasks = isPrivileged ? await _taskRepo.GetAllAsync() : await _taskRepo.GetByAssigneeAsync(userId);
        return Ok(tasks.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CrmTaskDto>> GetById(int id)
    {
        var task = await _taskRepo.GetByIdAsync(id);
        if (task == null) return NotFound();
        return Ok(MapToDto(task));
    }

    [HttpGet("overdue")]
    public async Task<ActionResult<IEnumerable<CrmTaskDto>>> GetOverdue()
    {
        var tasks = await _taskRepo.GetOverdueAsync();
        return Ok(tasks.Select(MapToDto));
    }

    [HttpGet("today")]
    public async Task<ActionResult<IEnumerable<CrmTaskDto>>> GetDueToday()
    {
        var tasks = await _taskRepo.GetDueTodayAsync();
        return Ok(tasks.Select(MapToDto));
    }

    [HttpPost]
    public async Task<ActionResult<CrmTaskDto>> Create([FromBody] CreateCrmTaskDto dto)
    {
        var userId = GetCurrentUserId();
        var task = new CrmTask
        {
            Title = dto.Title, Description = dto.Description,
            Priority = dto.Priority ?? "Medium", Status = dto.Status ?? "Todo",
            Type = dto.Type ?? "Task", DueDate = dto.DueDate,
            AssigneeId = dto.AssigneeId ?? userId,
            DealId = dto.DealId, ContactId = dto.ContactId
        };

        await _taskRepo.AddAsync(task);
        var created = await _taskRepo.GetByIdAsync(task.Id);
        return CreatedAtAction(nameof(GetById), new { id = task.Id }, MapToDto(created!));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CrmTaskDto>> Update(int id, [FromBody] UpdateCrmTaskDto dto)
    {
        var task = await _taskRepo.GetByIdAsync(id);
        if (task == null) return NotFound();

        if (dto.Title != null) task.Title = dto.Title;
        if (dto.Description != null) task.Description = dto.Description;
        if (dto.Priority != null) task.Priority = dto.Priority;
        if (dto.Status != null)
        {
            task.Status = dto.Status;
            if (dto.Status == "Completed") task.CompletedAt = DateTime.UtcNow;
        }
        if (dto.Type != null) task.Type = dto.Type;
        if (dto.DueDate.HasValue) task.DueDate = dto.DueDate;
        if (dto.AssigneeId.HasValue) task.AssigneeId = dto.AssigneeId.Value;
        if (dto.DealId.HasValue) task.DealId = dto.DealId;
        if (dto.ContactId.HasValue) task.ContactId = dto.ContactId;

        await _taskRepo.UpdateAsync(task);
        var updated = await _taskRepo.GetByIdAsync(id);
        return Ok(MapToDto(updated!));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "User";
        var userId = GetCurrentUserId();
        var task = await _taskRepo.GetByIdAsync(id);
        if (task == null) return NotFound();
        
        if (role == "User" && task.AssigneeId != userId)
            return Forbid();

        await _taskRepo.DeleteAsync(id);
        return NoContent();
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null ? int.Parse(claim.Value) : 1;
    }

    private static CrmTaskDto MapToDto(CrmTask t) => new(
        t.Id, t.Title, t.Description, t.Priority,
        t.Status, t.Type, t.DueDate, t.CompletedAt,
        t.CreatedAt, t.AssigneeId, t.Assignee?.FullName,
        t.DealId, t.Deal?.Title, t.ContactId,
        t.Contact != null ? $"{t.Contact.FirstName} {t.Contact.LastName}" : null);
}
