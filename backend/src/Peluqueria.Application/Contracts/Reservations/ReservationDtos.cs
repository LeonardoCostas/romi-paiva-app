using Peluqueria.Domain.Enums;

namespace Peluqueria.Application.Contracts.Reservations;

public sealed record ReservationResponse(
    Guid Id,
    Guid ClientId,
    Guid ServiceId,
    DateOnly Date,
    TimeOnly StartTime,
    TimeOnly EndTime,
    ReservationStatus Status,
    string? Notes);

public sealed record CreateReservationRequest(Guid ClientId, Guid ServiceId, DateOnly Date, TimeOnly StartTime, string? Notes);
public sealed record UpdateReservationRequest(DateOnly Date, TimeOnly StartTime, string? Notes);
public sealed record AvailabilityResponse(DateOnly Date, TimeOnly StartTime, TimeOnly EndTime, bool Available, string? Reason);