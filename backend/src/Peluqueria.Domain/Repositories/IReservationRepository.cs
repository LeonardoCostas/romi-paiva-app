using Peluqueria.Domain.Entities;
using Peluqueria.Domain.Enums;

namespace Peluqueria.Domain.Repositories;

public interface IReservationRepository
{
    Task<Reservation?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<IReadOnlyList<Reservation>> GetAllAsync(DateOnly? date, ReservationStatus? status, Guid? clientId, CancellationToken cancellationToken);
    Task<IReadOnlyList<Reservation>> GetByDateAsync(DateOnly date, CancellationToken cancellationToken);
    Task<Reservation?> GetLastCompletedEyelashSetAsync(Guid clientId, CancellationToken cancellationToken);
    Task AddAsync(Reservation reservation, CancellationToken cancellationToken);
}