using CRM.Core.DTOs;
using CRM.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/user-dashboard")]
[Authorize]
public class UserDashboardController : ControllerBase
{
    private readonly IContactRepository _contactRepo;
    private readonly IDealRepository _dealRepo;
    private readonly ICrmTaskRepository _taskRepo;
    private readonly IActivityRepository _activityRepo;

    public UserDashboardController(
        IContactRepository contactRepo,
        IDealRepository dealRepo,
        ICrmTaskRepository taskRepo,
        IActivityRepository activityRepo)
    {
        _contactRepo = contactRepo;
        _dealRepo = dealRepo;
        _taskRepo = taskRepo;
        _activityRepo = activityRepo;
    }

    [HttpGet]
    public async Task<ActionResult<UserDashboardDto>> GetUserDashboard()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(idClaim, out var userId))
            return Unauthorized();

        var myContacts = (await _contactRepo.GetByOwnerAsync(userId)).ToList();
        var myDeals = (await _dealRepo.GetByOwnerAsync(userId)).ToList();
        var myTasks = (await _taskRepo.GetByAssigneeAsync(userId)).ToList();
        var recentActivity = (await _activityRepo.GetRecentAsync(10)).ToList();

        var myRevenue = myDeals.Where(d => d.Stage == "Closed Won" && d.ActualCloseDate.HasValue)
                               .Sum(d => d.Value);
        var myPipeline = myDeals.Where(d => d.Stage != "Closed Won" && d.Stage != "Closed Lost")
                                .Sum(d => d.Value);
        var myActiveDealCount = myDeals.Count(d => d.Stage != "Closed Won" && d.Stage != "Closed Lost");
        var tasksDueToday = myTasks.Count(t => t.Status != "Completed" && t.DueDate.HasValue
                                               && t.DueDate.Value.Date == DateTime.UtcNow.Date);
        var overdueTasks = myTasks.Count(t => t.Status != "Completed" && t.DueDate.HasValue
                                              && t.DueDate.Value.Date < DateTime.UtcNow.Date);

        var dealsByStage = myDeals
            .GroupBy(d => d.Stage)
            .Select(g => new DealsByStageDto(g.Key, g.Count(), g.Sum(d => d.Value)))
            .ToList();

        var myTaskDtos = myTasks
            .Where(t => t.Status != "Completed")
            .OrderBy(t => t.DueDate)
            .Take(10)
            .Select(t => new CrmTaskDto(
                t.Id, t.Title, t.Description, t.Priority,
                t.Status, t.Type, t.DueDate, t.CompletedAt,
                t.CreatedAt, t.AssigneeId, null,
                t.DealId, t.Deal?.Title, t.ContactId, t.Contact != null ? $"{t.Contact.FirstName} {t.Contact.LastName}" : null))
            .ToList();

        var myDealDtos = myDeals
            .OrderByDescending(d => d.Value)
            .Take(5)
            .Select(d => new DealDto(
                d.Id, d.Title, d.Value, d.Stage, d.Probability,
                d.Description, d.Priority, d.ExpectedCloseDate,
                d.ActualCloseDate, d.CreatedAt,
                d.ContactId, d.Contact != null ? $"{d.Contact.FirstName} {d.Contact.LastName}" : null,
                d.CompanyId, d.Company?.Name, d.OwnerId, null))
            .ToList();

        var activityDtos = recentActivity
            .Select(a => new ActivityDto(a.Id, a.Type, a.Description, a.EntityType,
                a.EntityId, a.CreatedAt, a.UserId, a.User?.FullName))
            .ToList();

        return Ok(new UserDashboardDto(
            myContacts.Count, myDeals.Count, myActiveDealCount,
            myRevenue, myPipeline, tasksDueToday, overdueTasks,
            dealsByStage, myTaskDtos, myDealDtos, activityDtos));
    }
}

// DTO for the user-scoped dashboard
public record UserDashboardDto(
    int MyContacts, int MyDeals, int MyActiveDeals,
    decimal MyRevenue, decimal MyPipeline,
    int TasksDueToday, int OverdueTasks,
    List<DealsByStageDto> DealsByStage,
    List<CrmTaskDto> MyTasks,
    List<DealDto> TopDeals,
    List<ActivityDto> RecentActivities);
