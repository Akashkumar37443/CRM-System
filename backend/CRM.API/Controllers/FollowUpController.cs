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
public class FollowUpController : ControllerBase
{
    private readonly IContactRepository _contactRepo;
    private readonly IDealRepository _dealRepo;
    private readonly ICrmTaskRepository _taskRepo;
    private readonly IActivityRepository _activityRepo;

    public FollowUpController(
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

    [HttpGet("today")]
    public async Task<ActionResult<IEnumerable<FollowUpItemDto>>> GetTodayFollowUps()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(idClaim, out var userId))
            return Unauthorized();

        var contacts = await _contactRepo.GetByOwnerAsync(userId);
        var activeDeals = (await _dealRepo.GetByOwnerAsync(userId))
            .Where(d => d.Stage != "Closed Won" && d.Stage != "Closed Lost" && d.ContactId.HasValue)
            .ToList();
        var allTasks = await _taskRepo.GetByAssigneeAsync(userId);
        
        var results = new List<FollowUpItemDto>();

        foreach (var c in contacts)
        {
            var lastContactDate = await _activityRepo.GetLastContactDateAsync(c.Id);
            var daysSinceContact = lastContactDate.HasValue
                ? (int)(DateTime.UtcNow - lastContactDate.Value).TotalDays
                : (int)(DateTime.UtcNow - c.CreatedAt).TotalDays;

            var contactDeals = activeDeals.Where(d => d.ContactId == c.Id).ToList();
            var dealValue = contactDeals.Sum(d => d.Value);
            var primaryDeal = contactDeals.OrderByDescending(d => d.Value).FirstOrDefault();

            var contactTasks = allTasks.Where(t => t.ContactId == c.Id && t.Status != "Completed").ToList();
            var overdueTask = contactTasks.FirstOrDefault(t => t.DueDate.HasValue && t.DueDate.Value < DateTime.UtcNow);

            var dealStageWeight = primaryDeal?.Stage switch {
                "Lead" => 1,
                "Qualified" => 2,
                "Proposal" => 3,
                "Negotiation" => 4,
                _ => 0
            };

            int urgencyScore = (daysSinceContact * 3)
                             + (int)(dealValue / 10000)
                             + (overdueTask != null ? 20 : 0)
                             + (dealStageWeight * 5);

            string priority = urgencyScore > 60 ? "High" : urgencyScore >= 30 ? "Medium" : "Low";

            // Only suggest high or medium priority follow-ups, or skip if recently contacted
            if (daysSinceContact < 3 && overdueTask == null)
                continue; // Skip if contacted very recently and no overdue task

            results.Add(new FollowUpItemDto(
                c.Id,
                $"{c.FirstName} {c.LastName}",
                c.JobTitle,
                c.CompanyName,
                primaryDeal?.Id,
                primaryDeal?.Title,
                primaryDeal?.Value ?? 0,
                primaryDeal?.Stage ?? "",
                daysSinceContact,
                overdueTask != null,
                overdueTask?.Title,
                urgencyScore,
                priority
            ));
        }

        var topResults = results.OrderByDescending(r => r.UrgencyScore).Take(15).ToList();
        return Ok(topResults);
    }
}
