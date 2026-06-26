using Microsoft.EntityFrameworkCore;
using Peluqueria.Domain.Entities;
using Peluqueria.Domain.Repositories;
using Peluqueria.Infrastructure.Persistence;

namespace Peluqueria.Infrastructure.Repositories;

public sealed class ServiceRepository : IServiceRepository
{
    private readonly AppDbContext _dbContext;

    public ServiceRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<Service?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        _dbContext.Services.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Service>> GetAllAsync(bool? active, CancellationToken cancellationToken)
    {
        var query = _dbContext.Services.AsQueryable();
        if (active.HasValue)
        {
            query = query.Where(x => x.Active == active.Value);
        }

        return await query.OrderBy(x => x.Name).ToListAsync(cancellationToken);
    }

    public Task AddAsync(Service service, CancellationToken cancellationToken) =>
        _dbContext.Services.AddAsync(service, cancellationToken).AsTask();
}