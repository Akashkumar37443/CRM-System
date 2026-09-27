using CRM.Core.Entities;
using CRM.Core.Interfaces;
using CRM.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CRM.Infrastructure.Repositories;

// ============ Base Repository ============
public class Repository<T> : IRepository<T> where T : class
{
    protected readonly CrmDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public Repository(CrmDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public virtual async Task<T?> GetByIdAsync(int id) => await _dbSet.FindAsync(id);
    public virtual async Task<IEnumerable<T>> GetAllAsync() => await _dbSet.ToListAsync();

    public virtual async Task<T> AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public virtual async Task UpdateAsync(T entity)
    {
        _dbSet.Update(entity);
        await _context.SaveChangesAsync();
    }

    public virtual async Task DeleteAsync(int id)
    {
        var entity = await _dbSet.FindAsync(id);
        if (entity != null)
        {
            _dbSet.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}

// ============ User Repository ============
public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(CrmDbContext context) : base(context) { }

    public async Task<User?> GetByEmailAsync(string email)
        => await _dbSet.FirstOrDefaultAsync(u => u.Email == email);
}

// ============ Contact Repository ============
public class ContactRepository : Repository<Contact>, IContactRepository
{
    public ContactRepository(CrmDbContext context) : base(context) { }

    public override async Task<Contact?> GetByIdAsync(int id)
        => await _dbSet.Include(c => c.Company).Include(c => c.Owner)
            .FirstOrDefaultAsync(c => c.Id == id);

    public override async Task<IEnumerable<Contact>> GetAllAsync()
        => await _dbSet.Include(c => c.Company).Include(c => c.Owner)
            .OrderByDescending(c => c.CreatedAt).ToListAsync();

    public async Task<IEnumerable<Contact>> GetByOwnerAsync(int ownerId)
        => await _dbSet.Include(c => c.Company).Where(c => c.OwnerId == ownerId)
            .OrderByDescending(c => c.CreatedAt).ToListAsync();

    public async Task<IEnumerable<Contact>> SearchAsync(string query)
        => await _dbSet.Include(c => c.Company).Include(c => c.Owner)
            .Where(c => c.FirstName.Contains(query) || c.LastName.Contains(query) || c.Email.Contains(query))
            .OrderByDescending(c => c.CreatedAt).ToListAsync();

    public async Task<IEnumerable<Contact>> GetByCompanyAsync(int companyId)
        => await _dbSet.Include(c => c.Owner)
            .Where(c => c.CompanyId == companyId)
            .OrderByDescending(c => c.CreatedAt).ToListAsync();

    public async Task<int> GetCountAsync() => await _dbSet.CountAsync();
}

// ============ Company Repository ============
public class CompanyRepository : Repository<Company>, ICompanyRepository
{
    public CompanyRepository(CrmDbContext context) : base(context) { }

    public override async Task<Company?> GetByIdAsync(int id)
        => await _dbSet.Include(c => c.Contacts).Include(c => c.Deals)
            .FirstOrDefaultAsync(c => c.Id == id);

    public override async Task<IEnumerable<Company>> GetAllAsync()
        => await _dbSet.Include(c => c.Contacts).Include(c => c.Deals)
            .OrderByDescending(c => c.CreatedAt).ToListAsync();

    public async Task<IEnumerable<Company>> SearchAsync(string query)
        => await _dbSet.Include(c => c.Contacts).Include(c => c.Deals)
            .Where(c => c.Name.Contains(query) || (c.Industry != null && c.Industry.Contains(query)))
            .OrderByDescending(c => c.CreatedAt).ToListAsync();

    public async Task<int> GetCountAsync() => await _dbSet.CountAsync();
}

// ============ Deal Repository ============
public class DealRepository : Repository<Deal>, IDealRepository
{
    public DealRepository(CrmDbContext context) : base(context) { }

    public override async Task<Deal?> GetByIdAsync(int id)
        => await _dbSet.Include(d => d.Contact).Include(d => d.Company).Include(d => d.Owner)
            .FirstOrDefaultAsync(d => d.Id == id);

    public override async Task<IEnumerable<Deal>> GetAllAsync()
        => await _dbSet.Include(d => d.Contact).Include(d => d.Company).Include(d => d.Owner)
            .OrderByDescending(d => d.CreatedAt).ToListAsync();

    public async Task<IEnumerable<Deal>> GetByOwnerAsync(int ownerId)
        => await _dbSet.Include(d => d.Contact).Include(d => d.Company)
            .Where(d => d.OwnerId == ownerId)
            .OrderByDescending(d => d.CreatedAt).ToListAsync();

    public async Task<IEnumerable<Deal>> GetByStageAsync(string stage)
        => await _dbSet.Include(d => d.Contact).Include(d => d.Company).Include(d => d.Owner)
            .Where(d => d.Stage == stage)
            .OrderByDescending(d => d.CreatedAt).ToListAsync();

    public async Task<int> GetCountAsync() => await _dbSet.CountAsync();

    public async Task<decimal> GetTotalRevenueAsync()
        => await _dbSet.Where(d => d.Stage == "Closed Won").SumAsync(d => d.Value);

    public async Task<decimal> GetPipelineValueAsync()
        => await _dbSet.Where(d => d.Stage != "Closed Won" && d.Stage != "Closed Lost")
            .SumAsync(d => d.Value);
}

// ============ CrmTask Repository ============
public class CrmTaskRepository : Repository<CrmTask>, ICrmTaskRepository
{
    public CrmTaskRepository(CrmDbContext context) : base(context) { }

    public override async Task<CrmTask?> GetByIdAsync(int id)
        => await _dbSet.Include(t => t.Assignee).Include(t => t.Deal).Include(t => t.Contact)
            .FirstOrDefaultAsync(t => t.Id == id);

    public override async Task<IEnumerable<CrmTask>> GetAllAsync()
        => await _dbSet.Include(t => t.Assignee).Include(t => t.Deal).Include(t => t.Contact)
            .OrderByDescending(t => t.CreatedAt).ToListAsync();

    public async Task<IEnumerable<CrmTask>> GetByAssigneeAsync(int assigneeId)
        => await _dbSet.Include(t => t.Deal).Include(t => t.Contact)
            .Where(t => t.AssigneeId == assigneeId)
            .OrderByDescending(t => t.CreatedAt).ToListAsync();

    public async Task<IEnumerable<CrmTask>> GetOverdueAsync()
        => await _dbSet.Include(t => t.Assignee)
            .Where(t => t.DueDate < DateTime.UtcNow && t.Status != "Completed" && t.Status != "Cancelled")
            .OrderBy(t => t.DueDate).ToListAsync();

    public async Task<IEnumerable<CrmTask>> GetDueTodayAsync()
        => await _dbSet.Include(t => t.Assignee)
            .Where(t => t.DueDate != null && t.DueDate.Value.Date == DateTime.UtcNow.Date && t.Status != "Completed")
            .OrderBy(t => t.DueDate).ToListAsync();
}

// ============ Activity Repository ============
public class ActivityRepository : Repository<Activity>, IActivityRepository
{
    public ActivityRepository(CrmDbContext context) : base(context) { }

    public async Task<IEnumerable<Activity>> GetRecentAsync(int count = 20)
        => await _dbSet.Include(a => a.User)
            .OrderByDescending(a => a.CreatedAt).Take(count).ToListAsync();

    public async Task<IEnumerable<Activity>> GetByEntityAsync(string entityType, int entityId)
        => await _dbSet.Include(a => a.User)
            .Where(a => a.EntityType == entityType && a.EntityId == entityId)
            .OrderByDescending(a => a.CreatedAt).ToListAsync();

    public async Task<DateTime?> GetLastContactDateAsync(int contactId)
        => await _dbSet
            .Where(a => a.ContactId == contactId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => (DateTime?)a.CreatedAt)
            .FirstOrDefaultAsync();
}
