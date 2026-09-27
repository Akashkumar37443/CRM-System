using CRM.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace CRM.Infrastructure.Data;

public static class SeedData
{
    public static void Seed(ModelBuilder modelBuilder)
    {
        // BCrypt hash for "Admin@123" — in production, use proper hashing
        var passwordHash = "$2a$11$rZbKpBqLDmJPhGQ5DaTK4OZGo5bLwHxHlU9xG2WcPAZpxHGKzLxCu";

        // Users
        modelBuilder.Entity<User>().HasData(
            new User { Id = 1, FullName = "Admin User", Email = "admin@crm.com", PasswordHash = passwordHash, Role = "Admin", Department = "Management", Phone = "+1-555-0100", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 2, FullName = "Sarah Johnson", Email = "sarah@crm.com", PasswordHash = passwordHash, Role = "Manager", Department = "Sales", Phone = "+1-555-0101", IsActive = true, CreatedAt = new DateTime(2024, 1, 15, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 3, FullName = "Michael Chen", Email = "michael@crm.com", PasswordHash = passwordHash, Role = "User", Department = "Sales", Phone = "+1-555-0102", IsActive = true, CreatedAt = new DateTime(2024, 2, 1, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 4, FullName = "Emily Davis", Email = "emily@crm.com", PasswordHash = passwordHash, Role = "User", Department = "Marketing", Phone = "+1-555-0103", IsActive = true, CreatedAt = new DateTime(2024, 2, 15, 0, 0, 0, DateTimeKind.Utc) }
        );

        // Companies
        modelBuilder.Entity<Company>().HasData(
            new Company { Id = 1, Name = "TechVision Inc.", Industry = "Technology", Website = "https://techvision.com", Phone = "+1-555-1001", Email = "info@techvision.com", Address = "100 Innovation Blvd", City = "San Francisco", Country = "USA", Size = "201-500", AnnualRevenue = 50000000m, Description = "Leading AI and cloud solutions provider", CreatedAt = new DateTime(2024, 1, 10, 0, 0, 0, DateTimeKind.Utc) },
            new Company { Id = 2, Name = "Global Dynamics", Industry = "Manufacturing", Website = "https://globaldynamics.com", Phone = "+1-555-1002", Email = "contact@globaldynamics.com", Address = "500 Industrial Way", City = "Detroit", Country = "USA", Size = "500+", AnnualRevenue = 120000000m, Description = "Advanced manufacturing and robotics", CreatedAt = new DateTime(2024, 1, 20, 0, 0, 0, DateTimeKind.Utc) },
            new Company { Id = 3, Name = "HealthFirst Medical", Industry = "Healthcare", Website = "https://healthfirst.com", Phone = "+1-555-1003", Email = "info@healthfirst.com", Address = "200 Medical Center Dr", City = "Boston", Country = "USA", Size = "51-200", AnnualRevenue = 25000000m, Description = "Digital health and telemedicine solutions", CreatedAt = new DateTime(2024, 2, 5, 0, 0, 0, DateTimeKind.Utc) },
            new Company { Id = 4, Name = "EcoSmart Solutions", Industry = "Energy", Website = "https://ecosmart.com", Phone = "+1-555-1004", Email = "hello@ecosmart.com", Address = "75 Green Energy Rd", City = "Austin", Country = "USA", Size = "11-50", AnnualRevenue = 8000000m, Description = "Renewable energy consulting and implementation", CreatedAt = new DateTime(2024, 2, 20, 0, 0, 0, DateTimeKind.Utc) },
            new Company { Id = 5, Name = "FinanceFlow Corp", Industry = "Finance", Website = "https://financeflow.com", Phone = "+1-555-1005", Email = "support@financeflow.com", Address = "300 Wall St", City = "New York", Country = "USA", Size = "201-500", AnnualRevenue = 75000000m, Description = "Financial technology and payment processing", CreatedAt = new DateTime(2024, 3, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        // Contacts
        modelBuilder.Entity<Contact>().HasData(
            new Contact { Id = 1, FirstName = "James", LastName = "Wilson", Email = "james@techvision.com", Phone = "+1-555-2001", JobTitle = "CTO", Status = "Active", CompanyId = 1, OwnerId = 2, City = "San Francisco", Country = "USA", CreatedAt = new DateTime(2024, 1, 15, 0, 0, 0, DateTimeKind.Utc) },
            new Contact { Id = 2, FirstName = "Lisa", LastName = "Anderson", Email = "lisa@globaldynamics.com", Phone = "+1-555-2002", JobTitle = "VP of Operations", Status = "Active", CompanyId = 2, OwnerId = 2, City = "Detroit", Country = "USA", CreatedAt = new DateTime(2024, 1, 20, 0, 0, 0, DateTimeKind.Utc) },
            new Contact { Id = 3, FirstName = "Robert", LastName = "Martinez", Email = "robert@healthfirst.com", Phone = "+1-555-2003", JobTitle = "CEO", Status = "Active", CompanyId = 3, OwnerId = 3, City = "Boston", Country = "USA", CreatedAt = new DateTime(2024, 2, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Contact { Id = 4, FirstName = "Amanda", LastName = "Thompson", Email = "amanda@ecosmart.com", Phone = "+1-555-2004", JobTitle = "Head of Procurement", Status = "Lead", CompanyId = 4, OwnerId = 3, City = "Austin", Country = "USA", CreatedAt = new DateTime(2024, 2, 10, 0, 0, 0, DateTimeKind.Utc) },
            new Contact { Id = 5, FirstName = "David", LastName = "Kim", Email = "david@financeflow.com", Phone = "+1-555-2005", JobTitle = "CFO", Status = "Active", CompanyId = 5, OwnerId = 2, City = "New York", Country = "USA", CreatedAt = new DateTime(2024, 2, 15, 0, 0, 0, DateTimeKind.Utc) },
            new Contact { Id = 6, FirstName = "Jennifer", LastName = "Brown", Email = "jennifer@techvision.com", Phone = "+1-555-2006", JobTitle = "Product Manager", Status = "Active", CompanyId = 1, OwnerId = 4, City = "San Francisco", Country = "USA", CreatedAt = new DateTime(2024, 3, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Contact { Id = 7, FirstName = "Chris", LastName = "Taylor", Email = "chris@globaldynamics.com", Phone = "+1-555-2007", JobTitle = "Engineering Lead", Status = "Inactive", CompanyId = 2, OwnerId = 3, City = "Detroit", Country = "USA", CreatedAt = new DateTime(2024, 3, 10, 0, 0, 0, DateTimeKind.Utc) },
            new Contact { Id = 8, FirstName = "Michelle", LastName = "Garcia", Email = "michelle@gmail.com", Phone = "+1-555-2008", JobTitle = "Freelance Consultant", Status = "Lead", OwnerId = 4, City = "Los Angeles", Country = "USA", CreatedAt = new DateTime(2024, 3, 15, 0, 0, 0, DateTimeKind.Utc) }
        );

        // Deals
        modelBuilder.Entity<Deal>().HasData(
            new Deal { Id = 1, Title = "TechVision Cloud Migration", Value = 150000m, Stage = "Proposal", Probability = 60, Priority = "High", ContactId = 1, CompanyId = 1, OwnerId = 2, ExpectedCloseDate = new DateTime(2024, 6, 30, 0, 0, 0, DateTimeKind.Utc), CreatedAt = new DateTime(2024, 2, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Deal { Id = 2, Title = "Global Dynamics ERP System", Value = 320000m, Stage = "Negotiation", Probability = 75, Priority = "High", ContactId = 2, CompanyId = 2, OwnerId = 2, ExpectedCloseDate = new DateTime(2024, 5, 15, 0, 0, 0, DateTimeKind.Utc), CreatedAt = new DateTime(2024, 1, 25, 0, 0, 0, DateTimeKind.Utc) },
            new Deal { Id = 3, Title = "HealthFirst Telemedicine Platform", Value = 85000m, Stage = "Qualified", Probability = 40, Priority = "Medium", ContactId = 3, CompanyId = 3, OwnerId = 3, ExpectedCloseDate = new DateTime(2024, 7, 31, 0, 0, 0, DateTimeKind.Utc), CreatedAt = new DateTime(2024, 2, 15, 0, 0, 0, DateTimeKind.Utc) },
            new Deal { Id = 4, Title = "EcoSmart Solar Installation", Value = 45000m, Stage = "Lead", Probability = 20, Priority = "Low", ContactId = 4, CompanyId = 4, OwnerId = 3, ExpectedCloseDate = new DateTime(2024, 9, 30, 0, 0, 0, DateTimeKind.Utc), CreatedAt = new DateTime(2024, 3, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Deal { Id = 5, Title = "FinanceFlow Payment Gateway", Value = 200000m, Stage = "Closed Won", Probability = 100, Priority = "High", ContactId = 5, CompanyId = 5, OwnerId = 2, ExpectedCloseDate = new DateTime(2024, 4, 30, 0, 0, 0, DateTimeKind.Utc), ActualCloseDate = new DateTime(2024, 4, 15, 0, 0, 0, DateTimeKind.Utc), CreatedAt = new DateTime(2024, 1, 10, 0, 0, 0, DateTimeKind.Utc) },
            new Deal { Id = 6, Title = "TechVision AI Analytics", Value = 95000m, Stage = "Lead", Probability = 15, Priority = "Medium", ContactId = 6, CompanyId = 1, OwnerId = 4, ExpectedCloseDate = new DateTime(2024, 10, 31, 0, 0, 0, DateTimeKind.Utc), CreatedAt = new DateTime(2024, 3, 20, 0, 0, 0, DateTimeKind.Utc) },
            new Deal { Id = 7, Title = "Global Dynamics Automation", Value = 175000m, Stage = "Closed Won", Probability = 100, Priority = "High", ContactId = 2, CompanyId = 2, OwnerId = 2, ExpectedCloseDate = new DateTime(2024, 3, 31, 0, 0, 0, DateTimeKind.Utc), ActualCloseDate = new DateTime(2024, 3, 20, 0, 0, 0, DateTimeKind.Utc), CreatedAt = new DateTime(2024, 1, 5, 0, 0, 0, DateTimeKind.Utc) },
            new Deal { Id = 8, Title = "HealthFirst Data Analytics", Value = 62000m, Stage = "Proposal", Probability = 50, Priority = "Medium", ContactId = 3, CompanyId = 3, OwnerId = 3, ExpectedCloseDate = new DateTime(2024, 8, 15, 0, 0, 0, DateTimeKind.Utc), CreatedAt = new DateTime(2024, 3, 5, 0, 0, 0, DateTimeKind.Utc) },
            new Deal { Id = 9, Title = "FinanceFlow Fraud Detection", Value = 280000m, Stage = "Qualified", Probability = 35, Priority = "High", ContactId = 5, CompanyId = 5, OwnerId = 2, ExpectedCloseDate = new DateTime(2024, 11, 30, 0, 0, 0, DateTimeKind.Utc), CreatedAt = new DateTime(2024, 3, 25, 0, 0, 0, DateTimeKind.Utc) },
            new Deal { Id = 10, Title = "EcoSmart Consulting", Value = 30000m, Stage = "Closed Lost", Probability = 0, Priority = "Low", ContactId = 4, CompanyId = 4, OwnerId = 4, ExpectedCloseDate = new DateTime(2024, 4, 30, 0, 0, 0, DateTimeKind.Utc), ActualCloseDate = new DateTime(2024, 4, 10, 0, 0, 0, DateTimeKind.Utc), CreatedAt = new DateTime(2024, 2, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        // Tasks
        modelBuilder.Entity<CrmTask>().HasData(
            new CrmTask { Id = 1, Title = "Follow up with James Wilson", Description = "Discuss cloud migration requirements", Priority = "High", Status = "Todo", Type = "Call", DueDate = DateTime.UtcNow.AddDays(1), AssigneeId = 2, DealId = 1, ContactId = 1, CreatedAt = new DateTime(2024, 3, 20, 0, 0, 0, DateTimeKind.Utc) },
            new CrmTask { Id = 2, Title = "Send proposal to Global Dynamics", Description = "ERP system proposal document", Priority = "High", Status = "InProgress", Type = "Email", DueDate = DateTime.UtcNow.AddDays(2), AssigneeId = 2, DealId = 2, ContactId = 2, CreatedAt = new DateTime(2024, 3, 21, 0, 0, 0, DateTimeKind.Utc) },
            new CrmTask { Id = 3, Title = "Schedule demo for HealthFirst", Description = "Telemedicine platform demonstration", Priority = "Medium", Status = "Todo", Type = "Meeting", DueDate = DateTime.UtcNow.AddDays(5), AssigneeId = 3, DealId = 3, ContactId = 3, CreatedAt = new DateTime(2024, 3, 22, 0, 0, 0, DateTimeKind.Utc) },
            new CrmTask { Id = 4, Title = "Research EcoSmart competitors", Description = "Competitive analysis for solar proposal", Priority = "Low", Status = "Completed", Type = "Task", DueDate = DateTime.UtcNow.AddDays(-2), CompletedAt = DateTime.UtcNow.AddDays(-1), AssigneeId = 3, DealId = 4, ContactId = 4, CreatedAt = new DateTime(2024, 3, 15, 0, 0, 0, DateTimeKind.Utc) },
            new CrmTask { Id = 5, Title = "Review FinanceFlow contract", Description = "Legal review of payment gateway contract", Priority = "Urgent", Status = "Todo", Type = "Task", DueDate = DateTime.UtcNow, AssigneeId = 2, DealId = 9, ContactId = 5, CreatedAt = new DateTime(2024, 3, 25, 0, 0, 0, DateTimeKind.Utc) },
            new CrmTask { Id = 6, Title = "Update CRM data for Q1", Description = "Ensure all Q1 deals and contacts are up to date", Priority = "Medium", Status = "Todo", Type = "Task", DueDate = DateTime.UtcNow.AddDays(7), AssigneeId = 4, CreatedAt = new DateTime(2024, 3, 28, 0, 0, 0, DateTimeKind.Utc) }
        );

        // Activities
        modelBuilder.Entity<Activity>().HasData(
            new Activity { Id = 1, Type = "Created", Description = "Created deal: TechVision Cloud Migration", EntityType = "Deal", EntityId = 1, UserId = 2, CreatedAt = new DateTime(2024, 2, 1, 10, 0, 0, DateTimeKind.Utc) },
            new Activity { Id = 2, Type = "DealStageChanged", Description = "Deal moved to Proposal stage", EntityType = "Deal", EntityId = 1, UserId = 2, CreatedAt = new DateTime(2024, 3, 1, 14, 30, 0, DateTimeKind.Utc) },
            new Activity { Id = 3, Type = "Call", Description = "Called James Wilson about project timeline", EntityType = "Contact", EntityId = 1, UserId = 2, ContactId = 1, CreatedAt = new DateTime(2024, 3, 15, 9, 0, 0, DateTimeKind.Utc) },
            new Activity { Id = 4, Type = "Email", Description = "Sent pricing proposal to Lisa Anderson", EntityType = "Contact", EntityId = 2, UserId = 2, ContactId = 2, CreatedAt = new DateTime(2024, 3, 18, 11, 30, 0, DateTimeKind.Utc) },
            new Activity { Id = 5, Type = "Created", Description = "Created deal: HealthFirst Telemedicine Platform", EntityType = "Deal", EntityId = 3, UserId = 3, CreatedAt = new DateTime(2024, 2, 15, 8, 0, 0, DateTimeKind.Utc) },
            new Activity { Id = 6, Type = "Meeting", Description = "Meeting with Robert Martinez - product demo", EntityType = "Contact", EntityId = 3, UserId = 3, ContactId = 3, CreatedAt = new DateTime(2024, 3, 20, 15, 0, 0, DateTimeKind.Utc) },
            new Activity { Id = 7, Type = "Note", Description = "Amanda interested in solar panels for new office", EntityType = "Contact", EntityId = 4, UserId = 3, ContactId = 4, CreatedAt = new DateTime(2024, 3, 22, 10, 0, 0, DateTimeKind.Utc) },
            new Activity { Id = 8, Type = "DealStageChanged", Description = "FinanceFlow Payment Gateway moved to Closed Won", EntityType = "Deal", EntityId = 5, UserId = 2, CreatedAt = new DateTime(2024, 4, 15, 16, 0, 0, DateTimeKind.Utc) },
            new Activity { Id = 9, Type = "Created", Description = "New contact added: Michelle Garcia", EntityType = "Contact", EntityId = 8, UserId = 4, ContactId = 8, CreatedAt = new DateTime(2024, 3, 15, 14, 0, 0, DateTimeKind.Utc) },
            new Activity { Id = 10, Type = "Updated", Description = "Updated company info for Global Dynamics", EntityType = "Company", EntityId = 2, UserId = 2, CreatedAt = new DateTime(2024, 3, 25, 12, 0, 0, DateTimeKind.Utc) }
        );
    }
}
