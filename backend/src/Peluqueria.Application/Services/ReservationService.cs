using Peluqueria.Application.Abstractions;
using Peluqueria.Application.Common;
using Peluqueria.Application.Contracts.Notifications;
using Peluqueria.Application.Contracts.Reservations;
using Peluqueria.Domain.Entities;
using Peluqueria.Domain.Enums;
using Peluqueria.Domain.Repositories;

namespace Peluqueria.Application.Services;

public sealed class ReservationService
{
    private readonly IReservationRepository _reservationRepository;
    private readonly IClientRepository _clientRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly IBusinessHourRepository _businessHourRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly INotificationSender _notificationSender;

    public ReservationService(
        IReservationRepository reservationRepository,
        IClientRepository clientRepository,
        IServiceRepository serviceRepository,
        IBusinessHourRepository businessHourRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        INotificationSender notificationSender)
    {
        _reservationRepository = reservationRepository;
        _clientRepository = clientRepository;
        _serviceRepository = serviceRepository;
        _businessHourRepository = businessHourRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _notificationSender = notificationSender;
    }

    public async Task<IReadOnlyList<ReservationResponse>> GetAllAsync(DateOnly? date, ReservationStatus? status, Guid? clientId, CancellationToken cancellationToken)
    {
        var reservations = await _reservationRepository.GetAllAsync(date, status, clientId, cancellationToken);
        return reservations.Select(Map).ToList();
    }

    public async Task<Result<IReadOnlyList<ReservationResponse>>> GetMineAsync(CancellationToken cancellationToken)
    {
        var client = await GetCurrentClientAsync(cancellationToken);
        if (client is null)
        {
            return Result<IReadOnlyList<ReservationResponse>>.Ok(Array.Empty<ReservationResponse>());
        }

        var reservations = await _reservationRepository.GetAllAsync(null, null, client.Id, cancellationToken);
        return Result<IReadOnlyList<ReservationResponse>>.Ok(reservations.Select(Map).ToList());
    }

    public async Task<Result<ReservationResponse>> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var reservation = await _reservationRepository.GetByIdAsync(id, cancellationToken);
        if (reservation is null)
        {
            return Result<ReservationResponse>.Fail("Reserva no encontrada.");
        }

        if (_currentUserService.Role == UserRole.Cliente)
        {
            var client = await GetCurrentClientAsync(cancellationToken);
            if (client is null || reservation.ClientId != client.Id)
            {
                return Result<ReservationResponse>.Fail("No tenes permiso para ver esta reserva.");
            }
        }

        return Result<ReservationResponse>.Ok(Map(reservation));
    }

    public async Task<Result<ReservationResponse>> CreateAsync(CreateReservationRequest request, CancellationToken cancellationToken)
    {
        if (_currentUserService.Role == UserRole.Cliente)
        {
            var ownClient = await GetCurrentClientAsync(cancellationToken);
            if (ownClient is null || ownClient.Id != request.ClientId)
            {
                return Result<ReservationResponse>.Fail("Solo podés reservar turnos para tu perfil de cliente.");
            }
        }

        var validation = await ValidateReservationAsync(request.ClientId, request.ServiceId, request.Date, request.StartTime, null, cancellationToken);
        if (!validation.Success)
        {
            return Result<ReservationResponse>.Fail(validation.Error!);
        }

        var service = validation.Value!.Service;
        var endTime = request.StartTime.AddMinutes(service.DurationMinutes);
        var reservation = new Reservation(request.ClientId, request.ServiceId, request.Date, request.StartTime, endTime, _currentUserService.UserId, request.Notes);
        await _reservationRepository.AddAsync(reservation, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        if (validation.Value.Client is not null)
        {
            await _notificationSender.SendReservationCreatedAsync(
                new ReservationNotification(
                    validation.Value.Client.FirstName,
                    validation.Value.Client.LastName,
                    validation.Value.Client.Phone,
                    validation.Value.Service.Name,
                    reservation.Date,
                    reservation.StartTime,
                    reservation.EndTime),
                cancellationToken);
        }

        return Result<ReservationResponse>.Ok(Map(reservation), validation.Value.Warning);
    }

    public async Task<Result<ReservationResponse>> UpdateAsync(Guid id, UpdateReservationRequest request, CancellationToken cancellationToken)
    {
        var reservation = await _reservationRepository.GetByIdAsync(id, cancellationToken);
        if (reservation is null)
        {
            return Result<ReservationResponse>.Fail("Reserva no encontrada.");
        }

        var validation = await ValidateReservationAsync(reservation.ClientId, reservation.ServiceId, request.Date, request.StartTime, reservation.Id, cancellationToken);
        if (!validation.Success)
        {
            return Result<ReservationResponse>.Fail(validation.Error!);
        }

        var endTime = request.StartTime.AddMinutes(validation.Value!.Service.DurationMinutes);
        try
        {
            reservation.Reschedule(request.Date, request.StartTime, endTime, request.Notes);
        }
        catch (InvalidOperationException exception)
        {
            return Result<ReservationResponse>.Fail(exception.Message);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<ReservationResponse>.Ok(Map(reservation), validation.Value.Warning);
    }

    public async Task<Result<ReservationResponse>> ConfirmAsync(Guid id, CancellationToken cancellationToken)
    {
        var reservation = await _reservationRepository.GetByIdAsync(id, cancellationToken);
        if (reservation is null)
        {
            return Result<ReservationResponse>.Fail("Reserva no encontrada.");
        }

        try
        {
            reservation.Confirm();
        }
        catch (InvalidOperationException exception)
        {
            return Result<ReservationResponse>.Fail(exception.Message);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<ReservationResponse>.Ok(Map(reservation));
    }

    public async Task<Result<ReservationResponse>> CancelAsync(Guid id, CancellationToken cancellationToken)
    {
        var reservation = await _reservationRepository.GetByIdAsync(id, cancellationToken);
        if (reservation is null)
        {
            return Result<ReservationResponse>.Fail("Reserva no encontrada.");
        }

        if (_currentUserService.Role == UserRole.Cliente)
        {
            var client = await GetCurrentClientAsync(cancellationToken);
            if (client is null || reservation.ClientId != client.Id)
            {
                return Result<ReservationResponse>.Fail("No tenés permiso para cancelar esta reserva.");
            }
        }

        try
        {
            reservation.Cancel();
        }
        catch (InvalidOperationException exception)
        {
            return Result<ReservationResponse>.Fail(exception.Message);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<ReservationResponse>.Ok(Map(reservation));
    }

    public async Task<Result<ReservationResponse>> CompleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var reservation = await _reservationRepository.GetByIdAsync(id, cancellationToken);
        if (reservation is null)
        {
            return Result<ReservationResponse>.Fail("Reserva no encontrada.");
        }

        try
        {
            reservation.Complete();
        }
        catch (InvalidOperationException exception)
        {
            return Result<ReservationResponse>.Fail(exception.Message);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<ReservationResponse>.Ok(Map(reservation));
    }

    public async Task<Result<AvailabilityResponse>> CheckAvailabilityAsync(Guid serviceId, DateOnly date, TimeOnly startTime, CancellationToken cancellationToken)
    {
        var validation = await ValidateReservationAsync(Guid.Empty, serviceId, date, startTime, null, cancellationToken, validateClient: false, validateEyelashRules: false);
        if (!validation.Success)
        {
            return Result<AvailabilityResponse>.Fail(validation.Error!);
        }

        var endTime = startTime.AddMinutes(validation.Value!.Service.DurationMinutes);
        return Result<AvailabilityResponse>.Ok(new AvailabilityResponse(date, startTime, endTime, true, null), validation.Value.Warning);
    }

    private async Task<Result<ReservationValidationContext>> ValidateReservationAsync(
        Guid clientId,
        Guid serviceId,
        DateOnly date,
        TimeOnly startTime,
        Guid? reservationId,
        CancellationToken cancellationToken,
        bool validateClient = true,
        bool validateEyelashRules = true)
    {
        var service = await _serviceRepository.GetByIdAsync(serviceId, cancellationToken);
        if (service is null || !service.Active)
        {
            return Result<ReservationValidationContext>.Fail("El servicio no existe o está inactivo.");
        }

        Client? client = null;
        if (validateClient)
        {
            client = await _clientRepository.GetByIdAsync(clientId, cancellationToken);
            if (client is null || !client.Active)
            {
                return Result<ReservationValidationContext>.Fail("El cliente no existe o está inactivo.");
            }
        }

        var businessHour = await _businessHourRepository.GetByDayAsync(date.DayOfWeek, cancellationToken);
        if (businessHour is null || !businessHour.Active)
        {
            return Result<ReservationValidationContext>.Fail("No hay atención configurada para el día seleccionado.");
        }

        var endTime = startTime.AddMinutes(service.DurationMinutes);
        if (startTime < businessHour.OpeningTime || endTime > businessHour.ClosingTime)
        {
            return Result<ReservationValidationContext>.Fail("La reserva está fuera del horario de atención.");
        }

        var reservations = await _reservationRepository.GetByDateAsync(date, cancellationToken);
        var overlaps = reservations.Any(x =>
            x.Id != reservationId &&
            x.Status != ReservationStatus.Cancelada &&
            startTime < x.EndTime &&
            endTime > x.StartTime);

        if (overlaps)
        {
            return Result<ReservationValidationContext>.Fail("Ya existe una reserva en ese rango horario.");
        }

        string? warning = null;
        if (validateClient && validateEyelashRules && service.Category == ServiceCategory.Pestanias && service.EyelashServiceKind == EyelashServiceKind.Service)
        {
            var lastSet = await _reservationRepository.GetLastCompletedEyelashSetAsync(clientId, cancellationToken);
            if (lastSet is null)
            {
                return Result<ReservationValidationContext>.Fail("Para reservar un service de pestañas se requiere un historial previo de set completo.");
            }

            var daysSinceLastSet = date.DayNumber - lastSet.Date.DayNumber;
            if (daysSinceLastSet > 30)
            {
                return Result<ReservationValidationContext>.Fail("Pasaron más de 30 días desde el último set completo. Debe reservar Remoción + Set Completo.");
            }

            if (daysSinceLastSet > 21)
            {
                warning = "Pasaron más de 21 días desde el último set completo. El turno podrá cobrarse como Set Completo.";
            }
        }

        return Result<ReservationValidationContext>.Ok(new ReservationValidationContext(service, client, warning), warning);
    }

    private async Task<Client?> GetCurrentClientAsync(CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId != Guid.Empty)
        {
            var byUserId = await _clientRepository.GetByUserIdAsync(_currentUserService.UserId, cancellationToken);
            if (byUserId is not null)
            {
                return byUserId;
            }
        }

        var email = _currentUserService.Email?.Trim().ToLowerInvariant();
        return string.IsNullOrWhiteSpace(email)
            ? null
            : await _clientRepository.GetByEmailAsync(email, cancellationToken);
    }

    private static ReservationResponse Map(Reservation reservation) =>
        new(reservation.Id, reservation.ClientId, reservation.ServiceId, reservation.Date, reservation.StartTime, reservation.EndTime, reservation.Status, reservation.Notes);

    private sealed record ReservationValidationContext(Service Service, Client? Client, string? Warning);
}
