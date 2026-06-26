using Microsoft.EntityFrameworkCore;
using Peluqueria.Domain.Entities;
using Peluqueria.Domain.Enums;
using Peluqueria.Domain.Repositories;
using Peluqueria.Infrastructure.Persistence;

namespace Peluqueria.Infrastructure.Repositories;

public sealed class ReservationRepository : IReservationRepository
{
    private readonly AppDbContext _dbContext;

    public ReservationRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<Reservation?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        _dbContext.Reservations.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Reservation>> GetAllAsync(DateOnly? date, ReservationStatus? status, Guid? clientId, CancellationToken cancellationToken)
    {
        var query = _dbContext.Reservations.AsQueryable();

        if (date.HasValue)
        {
            query = query.Where(x => x.Date == date.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(x => x.Status == status.Value);
        }

        if (clientId.HasValue)
        {
            query = query.Where(x => x.ClientId == clientId.Value);
        }

        return await query.OrderBy(x => x.Date).ThenBy(x => x.StartTime).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Reservation>> GetByDateAsync(DateOnly date, CancellationToken cancellationToken) =>
        await _dbContext.Reservations.Where(x => x.Date == date).OrderBy(x => x.StartTime).ToListAsync(cancellationToken);

    public async Task<Reservation?> GetLastCompletedEyelashSetAsync(Guid clientId, CancellationToken cancellationToken)
    {
        return await (
            from reservation in _dbContext.Reservations
            join service in _dbContext.Services on reservation.ServiceId equals service.Id
            where reservation.ClientId == clientId
                  && reservation.Status == ReservationStatus.Completada
                  && service.Category == ServiceCategory.Pestanias
                  && service.EyelashServiceKind == EyelashServiceKind.SetCompleto
            orderby reservation.Date descending, reservation.StartTime descending
            select reservation
        ).FirstOrDefaultAsync(cancellationToken);
    }

    public Task AddAsync(Reservation reservation, CancellationToken cancellationToken) =>
        _dbContext.Reservations.AddAsync(reservation, cancellationToken).AsTask();
}