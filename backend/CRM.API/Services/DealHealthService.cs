using CRM.Core.Entities;
using CRM.Core.DTOs;

namespace CRM.API.Services;

public class DealHealthService
{
    public static DealHealthDto ComputeHealth(Deal deal, DateTime? lastActivityDate, int overdueTaskCount)
    {
        int score = 100;
        string? topRisk = null;
        int maxRiskPenalty = 0;

        void ApplyPenalty(int penalty, string riskReason)
        {
            score -= penalty;
            if (penalty > maxRiskPenalty)
            {
                maxRiskPenalty = penalty;
                topRisk = riskReason;
            }
        }

        // Factor 1: Days since any activity (max -35 points)
        int daysSinceActivity = lastActivityDate.HasValue
            ? (int)(DateTime.UtcNow - lastActivityDate.Value).TotalDays : 30;
        
        int activityPenalty = Math.Min(35, daysSinceActivity * 2);
        if (activityPenalty > 0)
            ApplyPenalty(activityPenalty, $"No contact in {daysSinceActivity} days");

        // Factor 2: Days stuck in current stage (max -25 points)
        int daysInStage = (int)(DateTime.UtcNow - deal.CreatedAt).TotalDays; // Simpler approx if we don't track stage entry date
        int expectedDays = deal.Stage switch {
            "Lead" => 7, "Qualified" => 14, "Proposal" => 21,
            "Negotiation" => 14, _ => 999
        };
        if (daysInStage > expectedDays)
        {
            int stagePenalty = Math.Min(25, (daysInStage - expectedDays) * 2);
            ApplyPenalty(stagePenalty, $"Stuck in {deal.Stage} for {daysInStage} days");
        }

        // Factor 3: Overdue tasks (max -20 points)
        if (overdueTaskCount > 0)
        {
            int taskPenalty = Math.Min(20, overdueTaskCount * 7);
            ApplyPenalty(taskPenalty, $"{overdueTaskCount} overdue tasks");
        }

        // Factor 4: Rep optimism check (max -20 points)
        int maxProbForStage = deal.Stage switch {
            "Lead" => 25, "Qualified" => 50, "Proposal" => 70,
            "Negotiation" => 90, _ => 100
        };
        if (deal.Probability > maxProbForStage + 20)
        {
            ApplyPenalty(20, "Probability too high for current stage");
        }

        score = Math.Max(0, Math.Min(100, score));

        string label = score >= 80 ? "Healthy" : score >= 50 ? "At Risk" : "Critical";

        return new DealHealthDto(
            deal.Id, deal.Title, deal.Value, deal.Stage,
            deal.Owner?.FullName ?? "Unknown",
            score, label, daysSinceActivity, daysInStage,
            overdueTaskCount, topRisk
        );
    }
}
