namespace CRM.Core.Entities;

public class Activity
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty; // Created, Updated, Note, Call, Email, Meeting, DealStageChanged
    public string Description { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty; // Contact, Company, Deal, Task
    public int EntityId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? Outcome { get; set; }
    public string? Channel { get; set; }

    // Foreign keys
    public int UserId { get; set; }
    public int? ContactId { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Contact? Contact { get; set; }
}
