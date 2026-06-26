using Microsoft.EntityFrameworkCore;
using Peluqueria.Domain.Entities;
using Peluqueria.Domain.Enums;
using Peluqueria.Domain.Repositories;
using Peluqueria.Infrastructure.Persistence;

namespace Peluqueria.Infrastructure.Repositories;

public sealed class RoleRepository : IRoleRepository
{
    private readonly AppDbContext _dbContext;

    public RoleRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<Role>> GetAllAsync(CancellationToken cancellationToken) =>
        await _dbContext.Roles.OrderBy(x => x.Code).ToListAsync(cancellationToken);

    public Task<Role?> GetByCodeAsync(UserRole code, CancellationToken cancellationToken) =>
        _dbContext.Roles.FirstOrDefaultAsync(x => x.Code == code, cancellationToken);

    public Task AddRangeAsync(IEnumerable<Role> roles, CancellationToken cancellationToken) =>
        _dbContext.Roles.AddRangeAsync(roles, cancellationToken);
}