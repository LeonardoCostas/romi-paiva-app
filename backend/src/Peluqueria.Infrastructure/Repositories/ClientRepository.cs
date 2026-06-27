using Microsoft.EntityFrameworkCore;
using Peluqueria.Domain.Entities;
using Peluqueria.Domain.Repositories;
using Peluqueria.Infrastructure.Persistence;

namespace Peluqueria.Infrastructure.Repositories;

public sealed class ClientRepository : IClientRepository
{
    private readonly AppDbContext _dbContext;

    public ClientRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<Client?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        _dbContext.Clients.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<Client?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken) =>
        _dbContext.Clients.FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);

    public Task<Client?> GetByEmailAsync(string email, CancellationToken cancellationToken) =>
        _dbContext.Clients.FirstOrDefaultAsync(x => x.Email == email.Trim().ToLowerInvariant(), cancellationToken);

    public async Task<IReadOnlyList<Client>> GetAllAsync(string? search, bool? active, CancellationToken cancellationToken)
    {
        var query = _dbContext.Clients.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalized = search.Trim().ToLowerInvariant();
            query = query.Where(x =>
                x.FirstName.ToLower().Contains(normalized) ||
                x.LastName.ToLower().Contains(normalized) ||
                x.Phone.ToLower().Contains(normalized) ||
                (x.Email != null && x.Email.ToLower().Contains(normalized)));
        }

        if (active.HasValue)
        {
            query = query.Where(x => x.Active == active.Value);
        }

        return await query.OrderBy(x => x.FirstName).ThenBy(x => x.LastName).ToListAsync(cancellationToken);
    }

    public Task AddAsync(Client client, CancellationToken cancellationToken) =>
        _dbContext.Clients.AddAsync(client, cancellationToken).AsTask();
}
