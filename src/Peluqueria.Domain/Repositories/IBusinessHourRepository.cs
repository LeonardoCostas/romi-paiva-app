using Peluqueria.Domain.Entities;

namespace Peluqueria.Domain.Repositories;

public interface IBusinessHourRepository
{
    Task<IReadOnlyList<BusinessHour>> GetAllAsync(CancellationToken cancellationToken);
    Task<BusinessHour?> GetByDayAsync(DayOfWeek dayOfWeek, CancellationToken cancellationToken);
    Task AddRangeAsync(IEnumerable<BusinessHour> businessHours, CancellationToken cancellationToken);
}