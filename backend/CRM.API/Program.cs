using System.Text;
using CRM.Core.Interfaces;
using CRM.Infrastructure.Data;
using CRM.Infrastructure.Repositories;
using CRM.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ============ Database ============
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var isRailway = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("RAILWAY_ENVIRONMENT"))
             || !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("RAILWAY_PROJECT_ID"));
var useSqlite = string.IsNullOrEmpty(connectionString) || isRailway
             || connectionString.Contains(".db") 
             || connectionString.StartsWith("Data Source=", StringComparison.OrdinalIgnoreCase);

if (useSqlite)
{
    var sqlitePath = isRailway ? "/app/data/crm.db" : "crm.db";
    var dir = Path.GetDirectoryName(sqlitePath);
    if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
        Directory.CreateDirectory(dir);
    
    var finalConnStr = $"Data Source={sqlitePath}";
    Console.WriteLine($"Using SQLite: {finalConnStr}");
    builder.Services.AddDbContext<CrmDbContext>(options => options.UseSqlite(finalConnStr));
}
else
{
    Console.WriteLine("Using SQL Server");
    builder.Services.AddDbContext<CrmDbContext>(options => options.UseSqlServer(connectionString));
}

// ============ Services & Cache ============
builder.Services.AddMemoryCache();

// ============ Repositories ============
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IContactRepository, ContactRepository>();
builder.Services.AddScoped<ICompanyRepository, CompanyRepository>();
builder.Services.AddScoped<IDealRepository, DealRepository>();
builder.Services.AddScoped<ICrmTaskRepository, CrmTaskRepository>();
builder.Services.AddScoped<IActivityRepository, ActivityRepository>();
builder.Services.AddScoped<IEmailService, EmailService>();

// ============ JWT Authentication ============
var jwtKey = builder.Configuration["Jwt:Key"] ?? "CrmSystemSuperSecretKey2024!@#$%^&*()VeryLong";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "CRM.API";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtIssuer,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// ============ Controllers ============
builder.Services.AddControllers();

// ============ CORS ============
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

var app = builder.Build();

// ============ Apply Migrations & Seed on startup ============
try
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<CrmDbContext>();
        db.Database.EnsureCreated();
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Database initialization error: {ex.Message}");
}

// ============ Middleware Pipeline ============
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
