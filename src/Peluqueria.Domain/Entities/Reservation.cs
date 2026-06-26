using Peluqueria.Domain.Common;
using Peluqueria.Domain.Enums;

namespace Peluqueria.Domain.Entities;

public sealed class Reservation : BaseEntity
{
    private Reservation()
    {
    }

    public Reservation(
        Guid clientId,
        Guid serviceId,
        DateOnly date,
        TimeOnly startTime,
        TimeOnly endTime,
        Guid createdByUserId,
        string? notes)
    {
        ClientId = clientId;
        ServiceId = serviceId;
        Date = date;
        StartTime = startTime;
        EndTime = endTime;
        CreatedByUserId = createdByUserId;
        Notes = notes;
        Status = ReservationStatus.Pendiente;
        ValidateTimeRange();
    }

    public Guid ClientId { get; private set; }
    public Guid ServiceId { get; private set; }
    public DateOnly Date { get; private set; }
    public TimeOnly StartTime { get; private set; }
    public TimeOnly EndTime { get; private set; }
    public ReservationStatus Status { get; private set; }
    public string? Notes { get; private set; }
    public Guid CreatedByUserId { get; private set; }

    public void Reschedule(DateOnly date, TimeOnly startTime, TimeOnly endTime, string? notes)
    {
        EnsureMutable();
        Date = date;
        StartTime = startTime;
        EndTime = endTime;
        Notes = notes;
        ValidateTimeRange();
        Touch();
    }

    public void Confirm()
    {
        if (Status != ReservationStatus.Pendiente)
        {
            throw new InvalidOperationException("Solo se pueden confirmar reservas pendientes.");
        }

        Status = ReservationStatus.Confirmada;
        Touch();
    }

    public void Cancel()
    {
        if (Status is ReservationStatus.Cancelada or ReservationStatus.Completada or ReservationStatus.Ausente)
        {
            throw new InvalidOperationException("La reserva no puede cancelarse en su estado actual.");
        }

        Status = ReservationStatus.Cancelada;
        Touch();
    }

    public void Complete()
    {
        if (Status is not (ReservationStatus.Pendiente or ReservationStatus.Confirmada))
        {
            throw new InvalidOperationException("Solo se pueden completar reservas pendientes o confirmadas.");
        }

        Status = ReservationStatus.Completada;
        Touch();
    }

    public void MarkAbsent()
    {
        if (Status is not (ReservationStatus.Pendiente or ReservationStatus.Confirmada))
        {
            throw new InvalidOperationException("Solo se puede marcar ausente una reserva pendiente o confirmada.");
        }

        Status = ReservationStatus.Ausente;
        Touch();
    }

    private void EnsureMutable()
    {
        if (Status is ReservationStatus.Cancelada or ReservationStatus.Completada or ReservationStatus.Ausente)
        {
            throw new InvalidOperationException("La reserva no puede modificarse en su estado actual.");
        }
    }

    private void ValidateTimeRange()
    {
        if (EndTime <= StartTime)
        {
            throw new InvalidOperationException("La hora de fin debe ser posterior a la hora de inicio.");
        }
    }
}