namespace CRM.Core.Entities;

public class Deal
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public string Stage { get; set; } = "Lead"; // Lead, Qualified, Proposal, Negotiation, Closed Won, Closed Lost
    public int Probability { get; set; } = 10; // 0-100
    public string? Description { get; set; }
    public string Priority { get; set; } = "Medium"; // Low, Medium, High
    public DateTime? ExpectedCloseDate { get; set; }
    public DateTime? ActualCloseDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Foreign keys
    public int? ContactId { get; set; }
    public int? CompanyId { get; set; }
    public int OwnerId { get; set; }

    // Navigation properties
    public Contact? Contact { get; set; }
    public Company? Company { get; set; }
    public User Owner { get; set; } = null!;
    public ICollection<CrmTask> Tasks { get; set; } = new List<CrmTask>();
    public ICollection<Activity> Activities { get; set; } = new List<Activity>();
}
