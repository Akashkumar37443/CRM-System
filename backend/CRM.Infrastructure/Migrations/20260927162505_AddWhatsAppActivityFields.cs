using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWhatsAppActivityFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Companies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Industry = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Website = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    City = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Country = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Size = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AnnualRevenue = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Logo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Companies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "User"),
                    Avatar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Department = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Contacts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    JobTitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Avatar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Active"),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    City = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Country = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastContactedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    OwnerId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contacts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Contacts_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Contacts_Users_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Deals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Value = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Stage = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Lead"),
                    Probability = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Priority = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpectedCloseDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ActualCloseDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ContactId = table.Column<int>(type: "int", nullable: true),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    OwnerId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Deals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Deals_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Deals_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Deals_Users_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Activities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EntityType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EntityId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Outcome = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Channel = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ContactId = table.Column<int>(type: "int", nullable: true),
                    DealId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Activities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Activities_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Activities_Deals_DealId",
                        column: x => x.DealId,
                        principalTable: "Deals",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Activities_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Tasks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Priority = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Medium"),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Todo"),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AssigneeId = table.Column<int>(type: "int", nullable: false),
                    DealId = table.Column<int>(type: "int", nullable: true),
                    ContactId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tasks_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Tasks_Deals_DealId",
                        column: x => x.DealId,
                        principalTable: "Deals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Tasks_Users_AssigneeId",
                        column: x => x.AssigneeId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Companies",
                columns: new[] { "Id", "Address", "AnnualRevenue", "City", "Country", "CreatedAt", "Description", "Email", "Industry", "Logo", "Name", "Phone", "Size", "Website" },
                values: new object[,]
                {
                    { 1, "100 Innovation Blvd", 50000000m, "San Francisco", "USA", new DateTime(2024, 1, 10, 0, 0, 0, 0, DateTimeKind.Utc), "Leading AI and cloud solutions provider", "info@techvision.com", "Technology", null, "TechVision Inc.", "+1-555-1001", "201-500", "https://techvision.com" },
                    { 2, "500 Industrial Way", 120000000m, "Detroit", "USA", new DateTime(2024, 1, 20, 0, 0, 0, 0, DateTimeKind.Utc), "Advanced manufacturing and robotics", "contact@globaldynamics.com", "Manufacturing", null, "Global Dynamics", "+1-555-1002", "500+", "https://globaldynamics.com" },
                    { 3, "200 Medical Center Dr", 25000000m, "Boston", "USA", new DateTime(2024, 2, 5, 0, 0, 0, 0, DateTimeKind.Utc), "Digital health and telemedicine solutions", "info@healthfirst.com", "Healthcare", null, "HealthFirst Medical", "+1-555-1003", "51-200", "https://healthfirst.com" },
                    { 4, "75 Green Energy Rd", 8000000m, "Austin", "USA", new DateTime(2024, 2, 20, 0, 0, 0, 0, DateTimeKind.Utc), "Renewable energy consulting and implementation", "hello@ecosmart.com", "Energy", null, "EcoSmart Solutions", "+1-555-1004", "11-50", "https://ecosmart.com" },
                    { 5, "300 Wall St", 75000000m, "New York", "USA", new DateTime(2024, 3, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Financial technology and payment processing", "support@financeflow.com", "Finance", null, "FinanceFlow Corp", "+1-555-1005", "201-500", "https://financeflow.com" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Avatar", "CreatedAt", "Department", "Email", "FullName", "IsActive", "PasswordHash", "Phone", "Role" },
                values: new object[,]
                {
                    { 1, null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Management", "admin@crm.com", "Admin User", true, "$2a$11$rZbKpBqLDmJPhGQ5DaTK4OZGo5bLwHxHlU9xG2WcPAZpxHGKzLxCu", "+1-555-0100", "Admin" },
                    { 2, null, new DateTime(2024, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Sales", "sarah@crm.com", "Sarah Johnson", true, "$2a$11$rZbKpBqLDmJPhGQ5DaTK4OZGo5bLwHxHlU9xG2WcPAZpxHGKzLxCu", "+1-555-0101", "Manager" },
                    { 3, null, new DateTime(2024, 2, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Sales", "michael@crm.com", "Michael Chen", true, "$2a$11$rZbKpBqLDmJPhGQ5DaTK4OZGo5bLwHxHlU9xG2WcPAZpxHGKzLxCu", "+1-555-0102", "User" },
                    { 4, null, new DateTime(2024, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Marketing", "emily@crm.com", "Emily Davis", true, "$2a$11$rZbKpBqLDmJPhGQ5DaTK4OZGo5bLwHxHlU9xG2WcPAZpxHGKzLxCu", "+1-555-0103", "User" }
                });

            migrationBuilder.InsertData(
                table: "Activities",
                columns: new[] { "Id", "Channel", "ContactId", "CreatedAt", "DealId", "Description", "EntityId", "EntityType", "Outcome", "Type", "UserId" },
                values: new object[,]
                {
                    { 1, null, null, new DateTime(2024, 2, 1, 10, 0, 0, 0, DateTimeKind.Utc), null, "Created deal: TechVision Cloud Migration", 1, "Deal", null, "Created", 2 },
                    { 2, null, null, new DateTime(2024, 3, 1, 14, 30, 0, 0, DateTimeKind.Utc), null, "Deal moved to Proposal stage", 1, "Deal", null, "DealStageChanged", 2 },
                    { 5, null, null, new DateTime(2024, 2, 15, 8, 0, 0, 0, DateTimeKind.Utc), null, "Created deal: HealthFirst Telemedicine Platform", 3, "Deal", null, "Created", 3 },
                    { 8, null, null, new DateTime(2024, 4, 15, 16, 0, 0, 0, DateTimeKind.Utc), null, "FinanceFlow Payment Gateway moved to Closed Won", 5, "Deal", null, "DealStageChanged", 2 },
                    { 10, null, null, new DateTime(2024, 3, 25, 12, 0, 0, 0, DateTimeKind.Utc), null, "Updated company info for Global Dynamics", 2, "Company", null, "Updated", 2 }
                });

            migrationBuilder.InsertData(
                table: "Contacts",
                columns: new[] { "Id", "Address", "Avatar", "City", "CompanyId", "Country", "CreatedAt", "Email", "FirstName", "JobTitle", "LastContactedAt", "LastName", "Notes", "OwnerId", "Phone", "Status" },
                values: new object[,]
                {
                    { 1, null, null, "San Francisco", 1, "USA", new DateTime(2024, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "james@techvision.com", "James", "CTO", null, "Wilson", null, 2, "+1-555-2001", "Active" },
                    { 2, null, null, "Detroit", 2, "USA", new DateTime(2024, 1, 20, 0, 0, 0, 0, DateTimeKind.Utc), "lisa@globaldynamics.com", "Lisa", "VP of Operations", null, "Anderson", null, 2, "+1-555-2002", "Active" },
                    { 3, null, null, "Boston", 3, "USA", new DateTime(2024, 2, 1, 0, 0, 0, 0, DateTimeKind.Utc), "robert@healthfirst.com", "Robert", "CEO", null, "Martinez", null, 3, "+1-555-2003", "Active" },
                    { 4, null, null, "Austin", 4, "USA", new DateTime(2024, 2, 10, 0, 0, 0, 0, DateTimeKind.Utc), "amanda@ecosmart.com", "Amanda", "Head of Procurement", null, "Thompson", null, 3, "+1-555-2004", "Lead" },
                    { 5, null, null, "New York", 5, "USA", new DateTime(2024, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "david@financeflow.com", "David", "CFO", null, "Kim", null, 2, "+1-555-2005", "Active" },
                    { 6, null, null, "San Francisco", 1, "USA", new DateTime(2024, 3, 1, 0, 0, 0, 0, DateTimeKind.Utc), "jennifer@techvision.com", "Jennifer", "Product Manager", null, "Brown", null, 4, "+1-555-2006", "Active" },
                    { 7, null, null, "Detroit", 2, "USA", new DateTime(2024, 3, 10, 0, 0, 0, 0, DateTimeKind.Utc), "chris@globaldynamics.com", "Chris", "Engineering Lead", null, "Taylor", null, 3, "+1-555-2007", "Inactive" },
                    { 8, null, null, "Los Angeles", null, "USA", new DateTime(2024, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "michelle@gmail.com", "Michelle", "Freelance Consultant", null, "Garcia", null, 4, "+1-555-2008", "Lead" }
                });

            migrationBuilder.InsertData(
                table: "Tasks",
                columns: new[] { "Id", "AssigneeId", "CompletedAt", "ContactId", "CreatedAt", "DealId", "Description", "DueDate", "Priority", "Status", "Title", "Type" },
                values: new object[] { 6, 4, null, null, new DateTime(2024, 3, 28, 0, 0, 0, 0, DateTimeKind.Utc), null, "Ensure all Q1 deals and contacts are up to date", new DateTime(2026, 10, 4, 16, 25, 4, 899, DateTimeKind.Utc).AddTicks(8039), "Medium", "Todo", "Update CRM data for Q1", "Task" });

            migrationBuilder.InsertData(
                table: "Activities",
                columns: new[] { "Id", "Channel", "ContactId", "CreatedAt", "DealId", "Description", "EntityId", "EntityType", "Outcome", "Type", "UserId" },
                values: new object[,]
                {
                    { 3, null, 1, new DateTime(2024, 3, 15, 9, 0, 0, 0, DateTimeKind.Utc), null, "Called James Wilson about project timeline", 1, "Contact", null, "Call", 2 },
                    { 4, null, 2, new DateTime(2024, 3, 18, 11, 30, 0, 0, DateTimeKind.Utc), null, "Sent pricing proposal to Lisa Anderson", 2, "Contact", null, "Email", 2 },
                    { 6, null, 3, new DateTime(2024, 3, 20, 15, 0, 0, 0, DateTimeKind.Utc), null, "Meeting with Robert Martinez - product demo", 3, "Contact", null, "Meeting", 3 },
                    { 7, null, 4, new DateTime(2024, 3, 22, 10, 0, 0, 0, DateTimeKind.Utc), null, "Amanda interested in solar panels for new office", 4, "Contact", null, "Note", 3 },
                    { 9, null, 8, new DateTime(2024, 3, 15, 14, 0, 0, 0, DateTimeKind.Utc), null, "New contact added: Michelle Garcia", 8, "Contact", null, "Created", 4 }
                });

            migrationBuilder.InsertData(
                table: "Deals",
                columns: new[] { "Id", "ActualCloseDate", "CompanyId", "ContactId", "CreatedAt", "Description", "ExpectedCloseDate", "OwnerId", "Priority", "Probability", "Stage", "Title", "Value" },
                values: new object[,]
                {
                    { 1, null, 1, 1, new DateTime(2024, 2, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), 2, "High", 60, "Proposal", "TechVision Cloud Migration", 150000m },
                    { 2, null, 2, 2, new DateTime(2024, 1, 25, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), 2, "High", 75, "Negotiation", "Global Dynamics ERP System", 320000m },
                    { 3, null, 3, 3, new DateTime(2024, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 7, 31, 0, 0, 0, 0, DateTimeKind.Utc), 3, "Medium", 40, "Qualified", "HealthFirst Telemedicine Platform", 85000m },
                    { 4, null, 4, 4, new DateTime(2024, 3, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 9, 30, 0, 0, 0, 0, DateTimeKind.Utc), 3, "Low", 20, "Lead", "EcoSmart Solar Installation", 45000m },
                    { 5, new DateTime(2024, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), 5, 5, new DateTime(2024, 1, 10, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 4, 30, 0, 0, 0, 0, DateTimeKind.Utc), 2, "High", 100, "Closed Won", "FinanceFlow Payment Gateway", 200000m },
                    { 6, null, 1, 6, new DateTime(2024, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 10, 31, 0, 0, 0, 0, DateTimeKind.Utc), 4, "Medium", 15, "Lead", "TechVision AI Analytics", 95000m },
                    { 7, new DateTime(2024, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc), 2, 2, new DateTime(2024, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 3, 31, 0, 0, 0, 0, DateTimeKind.Utc), 2, "High", 100, "Closed Won", "Global Dynamics Automation", 175000m },
                    { 8, null, 3, 3, new DateTime(2024, 3, 5, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 8, 15, 0, 0, 0, 0, DateTimeKind.Utc), 3, "Medium", 50, "Proposal", "HealthFirst Data Analytics", 62000m },
                    { 9, null, 5, 5, new DateTime(2024, 3, 25, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 11, 30, 0, 0, 0, 0, DateTimeKind.Utc), 2, "High", 35, "Qualified", "FinanceFlow Fraud Detection", 280000m },
                    { 10, new DateTime(2024, 4, 10, 0, 0, 0, 0, DateTimeKind.Utc), 4, 4, new DateTime(2024, 2, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 4, 30, 0, 0, 0, 0, DateTimeKind.Utc), 4, "Low", 0, "Closed Lost", "EcoSmart Consulting", 30000m }
                });

            migrationBuilder.InsertData(
                table: "Tasks",
                columns: new[] { "Id", "AssigneeId", "CompletedAt", "ContactId", "CreatedAt", "DealId", "Description", "DueDate", "Priority", "Status", "Title", "Type" },
                values: new object[,]
                {
                    { 1, 2, null, 1, new DateTime(2024, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Discuss cloud migration requirements", new DateTime(2026, 9, 28, 16, 25, 4, 899, DateTimeKind.Utc).AddTicks(5504), "High", "Todo", "Follow up with James Wilson", "Call" },
                    { 2, 2, null, 2, new DateTime(2024, 3, 21, 0, 0, 0, 0, DateTimeKind.Utc), 2, "ERP system proposal document", new DateTime(2026, 9, 29, 16, 25, 4, 899, DateTimeKind.Utc).AddTicks(7218), "High", "InProgress", "Send proposal to Global Dynamics", "Email" },
                    { 3, 3, null, 3, new DateTime(2024, 3, 22, 0, 0, 0, 0, DateTimeKind.Utc), 3, "Telemedicine platform demonstration", new DateTime(2026, 10, 2, 16, 25, 4, 899, DateTimeKind.Utc).AddTicks(7229), "Medium", "Todo", "Schedule demo for HealthFirst", "Meeting" },
                    { 4, 3, new DateTime(2026, 9, 26, 16, 25, 4, 899, DateTimeKind.Utc).AddTicks(7233), 4, new DateTime(2024, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), 4, "Competitive analysis for solar proposal", new DateTime(2026, 9, 25, 16, 25, 4, 899, DateTimeKind.Utc).AddTicks(7232), "Low", "Completed", "Research EcoSmart competitors", "Task" },
                    { 5, 2, null, 5, new DateTime(2024, 3, 25, 0, 0, 0, 0, DateTimeKind.Utc), 9, "Legal review of payment gateway contract", new DateTime(2026, 9, 27, 16, 25, 4, 899, DateTimeKind.Utc).AddTicks(8036), "Urgent", "Todo", "Review FinanceFlow contract", "Task" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Activities_ContactId",
                table: "Activities",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_DealId",
                table: "Activities",
                column: "DealId");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_UserId",
                table: "Activities",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_CompanyId",
                table: "Contacts",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_OwnerId",
                table: "Contacts",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_Deals_CompanyId",
                table: "Deals",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Deals_ContactId",
                table: "Deals",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Deals_OwnerId",
                table: "Deals",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_AssigneeId",
                table: "Tasks",
                column: "AssigneeId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_ContactId",
                table: "Tasks",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_DealId",
                table: "Tasks",
                column: "DealId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Activities");

            migrationBuilder.DropTable(
                name: "Tasks");

            migrationBuilder.DropTable(
                name: "Deals");

            migrationBuilder.DropTable(
                name: "Contacts");

            migrationBuilder.DropTable(
                name: "Companies");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
