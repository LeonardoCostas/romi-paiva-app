using Peluqueria.Domain.Entities;

namespace Peluqueria.Domain.Repositories;

public interface IServiceRepository
{
    Task<Service?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<IReadOnlyList<Service>> GetAllAsync(bool? active, CancellationToken cancellationToken);
    Task AddAsync(Service service, CancellationToken cancellationToken);
}