namespace Peluqueria.Application.Contracts.Notifications;

public sealed record ReservationNotification(
    string ClientFirstName,
    string ClientLastName,
    string Phone,
    string ServiceName,
    DateOnly Date,
    TimeOnly StartTime,
    TimeOnly EndTime);
