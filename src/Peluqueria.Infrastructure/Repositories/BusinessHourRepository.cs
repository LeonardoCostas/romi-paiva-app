using Microsoft.EntityFrameworkCore;
using Peluqueria.Domain.Entities;
using Peluqueria.Domain.Repositories;
using Peluqueria.Infrastructure.Persistence;

namespace Peluqueria.Infrastructure.Repositories;

public sealed class BusinessHourRepository : IBusinessHourRepository
{
    private readonly AppDbContext _dbContext;

    public BusinessHourRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<BusinessHour>> GetAllAsync(CancellationToken cancellationToken) =>
        await _dbContext.BusinessHours.OrderBy(x => x.DayOfWeek).ToListAsync(cancellationToken);

    public Task<BusinessHour?> GetByDayAsync(DayOfWeek dayOfWeek, CancellationToken cancellationToken) =>
        _dbContext.BusinessHours.FirstOrDefaultAsync(x => x.DayOfWeek == dayOfWeek, cancellationToken);

    public Task AddRangeAsync(IEnumerable<BusinessHour> businessHours, CancellationToken cancellationToken) =>
        _dbContext.BusinessHours.AddRangeAsync(businessHours, cancellationToken);
}