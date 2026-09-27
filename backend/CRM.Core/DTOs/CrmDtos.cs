namespace CRM.Core.DTOs;

// ============ Auth DTOs ============
public record LoginDto(string Email, string Password);
public record RegisterDto(string FullName, string Email, string Password, string? Phone);
public record AuthResponseDto(string Token, UserDto User);

// ============ User DTOs ============
public record UserDto(int Id, string FullName, string Email, string Role, string? Avatar, string? Phone, string? Department, bool IsActive);

// ============ Contact DTOs ============
public record ContactDto(
    int Id, string FirstName, string LastName, string Email, string? Phone,
    string? JobTitle, string? Avatar, string Status, string? Notes,
    string? Address, string? City, string? Country,
    DateTime CreatedAt, DateTime? LastContactedAt,
    int? CompanyId, string? CompanyName, int OwnerId, string? OwnerName);

public record CreateContactDto(
    string FirstName, string LastName, string Email, string? Phone,
    string? JobTitle, string? Avatar, string? Status, string? Notes,
    string? Address, string? City, string? Country, int? CompanyId);

public record UpdateContactDto(
    string? FirstName, string? LastName, string? Email, string? Phone,
    string? JobTitle, string? Avatar, string? Status, string? Notes,
    string? Address, string? City, string? Country, int? CompanyId);

// ============ Company DTOs ============
public record CompanyDto(
    int Id, string Name, string? Industry, string? Website, string? Phone,
    string? Email, string? Address, string? City, string? Country,
    string? Size, decimal? AnnualRevenue, string? Description, string? Logo,
    DateTime CreatedAt, int ContactCount, int DealCount);

public record CreateCompanyDto(
    string Name, string? Industry, string? Website, string? Phone,
    string? Email, string? Address, string? City, string? Country,
    string? Size, decimal? AnnualRevenue, string? Description, string? Logo);

public record UpdateCompanyDto(
    string? Name, string? Industry, string? Website, string? Phone,
    string? Email, string? Address, string? City, string? Country,
    string? Size, decimal? AnnualRevenue, string? Description, string? Logo);

// ============ Deal DTOs ============
public record DealDto(
    int Id, string Title, decimal Value, string Stage, int Probability,
    string? Description, string Priority, DateTime? ExpectedCloseDate,
    DateTime? ActualCloseDate, DateTime CreatedAt,
    int? ContactId, string? ContactName, int? CompanyId, string? CompanyName,
    int OwnerId, string? OwnerName);

public record CreateDealDto(
    string Title, decimal Value, string? Stage, int? Probability,
    string? Description, string? Priority, DateTime? ExpectedCloseDate,
    int? ContactId, int? CompanyId);

public record UpdateDealDto(
    string? Title, decimal? Value, string? Stage, int? Probability,
    string? Description, string? Priority, DateTime? ExpectedCloseDate,
    DateTime? ActualCloseDate, int? ContactId, int? CompanyId);

// ============ Task DTOs ============
public record CrmTaskDto(
    int Id, string Title, string? Description, string Priority,
    string Status, string Type, DateTime? DueDate, DateTime? CompletedAt,
    DateTime CreatedAt, int AssigneeId, string? AssigneeName,
    int? DealId, string? DealTitle, int? ContactId, string? ContactName);

public record CreateCrmTaskDto(
    string Title, string? Description, string? Priority,
    string? Status, string? Type, DateTime? DueDate,
    int? AssigneeId, int? DealId, int? ContactId);

public record UpdateCrmTaskDto(
    string? Title, string? Description, string? Priority,
    string? Status, string? Type, DateTime? DueDate,
    int? AssigneeId, int? DealId, int? ContactId);

// ============ Activity DTOs ============
public record ActivityDto(
    int Id, string Type, string Description, string EntityType,
    int EntityId, DateTime CreatedAt, int UserId, string? UserName);

// ============ Dashboard DTOs ============
public record DashboardDto(
    int TotalContacts, int TotalCompanies, int TotalDeals,
    decimal TotalRevenue, decimal PipelineValue, int TasksDueToday,
    int OverdueTasks, int ActiveDeals,
    List<DealsByStageDto> DealsByStage,
    List<RevenueByMonthDto> RevenueByMonth,
    List<ActivityDto> RecentActivities);

public record DealsByStageDto(string Stage, int Count, decimal TotalValue);
public record RevenueByMonthDto(string Month, decimal Revenue);
