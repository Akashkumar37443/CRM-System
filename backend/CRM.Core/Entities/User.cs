namespace CRM.Core.Entities;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "User"; // Admin, Manager, User
    public string? Avatar { get; set; }
    public string? Phone { get; set; }
    public string? Department { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
    public bool RequiresPasswordChange { get; set; } = false;

    // Navigation properties
    public ICollection<Contact> OwnedContacts { get; set; } = new List<Contact>();
    public ICollection<Deal> OwnedDeals { get; set; } = new List<Deal>();
    public ICollection<CrmTask> AssignedTasks { get; set; } = new List<CrmTask>();
    public ICollection<Activity> Activities { get; set; } = new List<Activity>();
}
