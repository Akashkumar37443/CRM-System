using CRM.Core.Entities;

namespace CRM.Core.Interfaces;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(int id);
}

public interface IContactRepository : IRepository<Contact>
{
    Task<IEnumerable<Contact>> GetByOwnerAsync(int ownerId);
    Task<IEnumerable<Contact>> SearchAsync(string query);
    Task<IEnumerable<Contact>> GetByCompanyAsync(int companyId);
    Task<int> GetCountAsync();
}

public interface ICompanyRepository : IRepository<Company>
{
    Task<IEnumerable<Company>> SearchAsync(string query);
    Task<int> GetCountAsync();
}

public interface IDealRepository : IRepository<Deal>
{
    Task<IEnumerable<Deal>> GetByOwnerAsync(int ownerId);
    Task<IEnumerable<Deal>> GetByStageAsync(string stage);
    Task<int> GetCountAsync();
    Task<decimal> GetTotalRevenueAsync();
    Task<decimal> GetPipelineValueAsync();
    Task<IEnumerable<Deal>> GetActiveDealsWithDetailsAsync();
}

public interface ICrmTaskRepository : IRepository<CrmTask>
{
    Task<IEnumerable<CrmTask>> GetByAssigneeAsync(int assigneeId);
    Task<IEnumerable<CrmTask>> GetOverdueAsync();
    Task<IEnumerable<CrmTask>> GetDueTodayAsync();
}

public interface IActivityRepository : IRepository<Activity>
{
    Task<IEnumerable<Activity>> GetRecentAsync(int count = 20);
    Task<IEnumerable<Activity>> GetByEntityAsync(string entityType, int entityId);
    Task<DateTime?> GetLastContactDateAsync(int contactId);
}

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
}
