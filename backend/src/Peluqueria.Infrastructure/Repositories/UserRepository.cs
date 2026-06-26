using Microsoft.EntityFrameworkCore;
using Peluqueria.Domain.Entities;
using Peluqueria.Domain.Repositories;
using Peluqueria.Infrastructure.Persistence;

namespace Peluqueria.Infrastructure.Repositories;

public sealed class UserRepository : IUserRepository
{
    private readonly AppDbContext _dbContext;

    public UserRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        _dbContext.Users.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken) =>
        _dbContext.Users.FirstOrDefaultAsync(x => x.Email == email, cancellationToken);

    public async Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken) =>
        await _dbContext.Users.OrderBy(x => x.FirstName).ThenBy(x => x.LastName).ToListAsync(cancellationToken);

    public Task AddAsync(User user, CancellationToken cancellationToken) =>
        _dbContext.Users.AddAsync(user, cancellationToken).AsTask();
}