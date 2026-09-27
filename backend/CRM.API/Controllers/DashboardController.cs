using CRM.Core.DTOs;
using CRM.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IContactRepository _contactRepo;
    private readonly ICompanyRepository _companyRepo;
    private readonly IDealRepository _dealRepo;
    private readonly ICrmTaskRepository _taskRepo;
    private readonly IActivityRepository _activityRepo;

    public DashboardController(
        IContactRepository contactRepo,
        ICompanyRepository companyRepo,
        IDealRepository dealRepo,
        ICrmTaskRepository taskRepo,
        IActivityRepository activityRepo)
    {
        _contactRepo = contactRepo;
        _companyRepo = companyRepo;
        _dealRepo = dealRepo;
        _taskRepo = taskRepo;
        _activityRepo = activityRepo;
    }

    [HttpGet]
    public async Task<ActionResult<DashboardDto>> GetDashboard()
    {
        var totalContacts = await _contactRepo.GetCountAsync();
        var totalCompanies = await _companyRepo.GetCountAsync();
        var totalDeals = await _dealRepo.GetCountAsync();
        var totalRevenue = await _dealRepo.GetTotalRevenueAsync();
        var pipelineValue = await _dealRepo.GetPipelineValueAsync();

        var tasksDueToday = (await _taskRepo.GetDueTodayAsync()).Count();
        var overdueTasks = (await _taskRepo.GetOverdueAsync()).Count();

        var allDeals = await _dealRepo.GetAllAsync();
        var activeDeals = allDeals.Count(d => d.Stage != "Closed Won" && d.Stage != "Closed Lost");

        var dealsByStage = allDeals
            .GroupBy(d => d.Stage)
            .Select(g => new DealsByStageDto(g.Key, g.Count(), g.Sum(d => d.Value)))
            .ToList();

        // Revenue by month (from closed won deals)
        var revenueByMonth = allDeals
            .Where(d => d.Stage == "Closed Won" && d.ActualCloseDate.HasValue)
            .GroupBy(d => d.ActualCloseDate!.Value.ToString("MMM yyyy"))
            .Select(g => new RevenueByMonthDto(g.Key, g.Sum(d => d.Value)))
            .ToList();

        var recentActivities = (await _activityRepo.GetRecentAsync(10))
            .Select(a => new ActivityDto(
                a.Id, a.Type, a.Description, a.EntityType,
                a.EntityId, a.CreatedAt, a.UserId, a.User?.FullName))
            .ToList();

        return Ok(new DashboardDto(
            totalContacts, totalCompanies, totalDeals,
            totalRevenue, pipelineValue, tasksDueToday,
            overdueTasks, activeDeals,
            dealsByStage, revenueByMonth, recentActivities));
    }
}
