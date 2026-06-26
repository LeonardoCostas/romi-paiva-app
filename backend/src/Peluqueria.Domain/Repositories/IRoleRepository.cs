using Peluqueria.Domain.Entities;
using Peluqueria.Domain.Enums;

namespace Peluqueria.Domain.Repositories;

public interface IRoleRepository
{
    Task<IReadOnlyList<Role>> GetAllAsync(CancellationToken cancellationToken);
    Task<Role?> GetByCodeAsync(UserRole code, CancellationToken cancellationToken);
    Task AddRangeAsync(IEnumerable<Role> roles, CancellationToken cancellationToken);
}