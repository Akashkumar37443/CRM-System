namespace CRM.Core.Entities;

/// <summary>
/// Named CrmTask to avoid collision with System.Threading.Tasks.Task
/// </summary>
public class CrmTask
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Priority { get; set; } = "Medium"; // Low, Medium, High, Urgent
    public string Status { get; set; } = "Todo"; // Todo, InProgress, Completed, Cancelled
    public string Type { get; set; } = "Task"; // Task, Call, Email, Meeting
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Foreign keys
    public int AssigneeId { get; set; }
    public int? DealId { get; set; }
    public int? ContactId { get; set; }

    // Navigation properties
    public User Assignee { get; set; } = null!;
    public Deal? Deal { get; set; }
    public Contact? Contact { get; set; }
}
