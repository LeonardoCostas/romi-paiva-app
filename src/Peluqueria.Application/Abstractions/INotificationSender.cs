using Peluqueria.Application.Contracts.Notifications;

namespace Peluqueria.Application.Abstractions;

public interface INotificationSender
{
    Task SendReservationCreatedAsync(ReservationNotification notification, CancellationToken cancellationToken);
}
