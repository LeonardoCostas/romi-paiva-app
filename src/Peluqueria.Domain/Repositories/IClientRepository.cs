using Peluqueria.Domain.Entities;

namespace Peluqueria.Domain.Repositories;

public interface IClientRepository
{
    Task<Client?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<Client?> GetByEmailAsync(string email, CancellationToken cancellationToken);
    Task<IReadOnlyList<Client>> GetAllAsync(string? search, bool? active, CancellationToken cancellationToken);
    Task AddAsync(Client client, CancellationToken cancellationToken);
}