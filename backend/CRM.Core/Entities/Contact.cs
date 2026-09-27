namespace CRM.Core.Entities;

public class Contact
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? JobTitle { get; set; }
    public string? Avatar { get; set; }
    public string Status { get; set; } = "Active"; // Active, Inactive, Lead
    public string? Notes { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastContactedAt { get; set; }

    // Foreign keys
    public int? CompanyId { get; set; }
    public int OwnerId { get; set; }

    // Navigation properties
    public Company? Company { get; set; }
    public User Owner { get; set; } = null!;
    public ICollection<Deal> Deals { get; set; } = new List<Deal>();
    public ICollection<CrmTask> Tasks { get; set; } = new List<CrmTask>();
    public ICollection<Activity> Activities { get; set; } = new List<Activity>();
}
