using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Peluqueria.Api.Common;
using Peluqueria.Application.Contracts.Reservations;
using Peluqueria.Application.Services;
using Peluqueria.Domain.Enums;

namespace Peluqueria.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/reservations")]
public sealed class ReservationsController : ControllerBase
{
    [Authorize(Roles = nameof(UserRole.Admin))]
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ReservationResponse>>>> GetAll(
        [FromServices] ReservationService reservationService,
        [FromQuery] DateOnly? date,
        [FromQuery] ReservationStatus? status,
        [FromQuery] Guid? clientId,
        CancellationToken cancellationToken)
    {
        var items = await reservationService.GetAllAsync(date, status, clientId, cancellationToken);
        return Ok(new ApiResponse<IReadOnlyList<ReservationResponse>>(true, items, null, null));
    }

    [Authorize(Roles = nameof(UserRole.Cliente))]
    [HttpGet("mine")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ReservationResponse>>>> GetMine(
        [FromServices] ReservationService reservationService,
        CancellationToken cancellationToken)
    {
        var result = await reservationService.GetMineAsync(cancellationToken);
        return ApiResponseFactory.FromResult(this, result);
    }

    [Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Cliente)}")]
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ReservationResponse>>> GetById(
        Guid id,
        [FromServices] ReservationService reservationService,
        CancellationToken cancellationToken)
    {
        var result = await reservationService.GetByIdAsync(id, cancellationToken);
        return ApiResponseFactory.FromResult(this, result);
    }

    [Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Cliente)}")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ReservationResponse>>> Create(
        [FromServices] ReservationService reservationService,
        [FromBody] CreateReservationRequest request,
        CancellationToken cancellationToken)
    {
        var result = await reservationService.CreateAsync(request, cancellationToken);
        return ApiResponseFactory.FromResult(this, result, StatusCodes.Status201Created);
    }

    [Authorize(Roles = nameof(UserRole.Admin))]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ReservationResponse>>> Update(
        Guid id,
        [FromServices] ReservationService reservationService,
        [FromBody] UpdateReservationRequest request,
        CancellationToken cancellationToken)
    {
        var result = await reservationService.UpdateAsync(id, request, cancellationToken);
        return ApiResponseFactory.FromResult(this, result);
    }

    [Authorize(Roles = nameof(UserRole.Admin))]
    [HttpPatch("{id:guid}/confirm")]
    public async Task<ActionResult<ApiResponse<ReservationResponse>>> Confirm(
        Guid id,
        [FromServices] ReservationService reservationService,
        CancellationToken cancellationToken)
    {
        var result = await reservationService.ConfirmAsync(id, cancellationToken);
        return ApiResponseFactory.FromResult(this, result);
    }

    [Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Cliente)}")]
    [HttpPatch("{id:guid}/cancel")]
    public async Task<ActionResult<ApiResponse<ReservationResponse>>> Cancel(
        Guid id,
        [FromServices] ReservationService reservationService,
        CancellationToken cancellationToken)
    {
        var result = await reservationService.CancelAsync(id, cancellationToken);
        return ApiResponseFactory.FromResult(this, result);
    }

    [Authorize(Roles = nameof(UserRole.Admin))]
    [HttpPatch("{id:guid}/complete")]
    public async Task<ActionResult<ApiResponse<ReservationResponse>>> Complete(
        Guid id,
        [FromServices] ReservationService reservationService,
        CancellationToken cancellationToken)
    {
        var result = await reservationService.CompleteAsync(id, cancellationToken);
        return ApiResponseFactory.FromResult(this, result);
    }

    [Authorize(Roles = nameof(UserRole.Admin))]
    [HttpPatch("{id:guid}/absent")]
    public async Task<ActionResult<ApiResponse<ReservationResponse>>> MarkAbsent(
        Guid id,
        [FromServices] ReservationService reservationService,
        CancellationToken cancellationToken)
    {
        var result = await reservationService.MarkAbsentAsync(id, cancellationToken);
        return ApiResponseFactory.FromResult(this, result);
    }

    [AllowAnonymous]
    [HttpGet("availability")]
    public async Task<ActionResult<ApiResponse<AvailabilityResponse>>> CheckAvailability(
        [FromServices] ReservationService reservationService,
        [FromQuery] Guid serviceId,
        [FromQuery] DateOnly date,
        [FromQuery] TimeOnly startTime,
        CancellationToken cancellationToken)
    {
        var result = await reservationService.CheckAvailabilityAsync(serviceId, date, startTime, cancellationToken);
        return ApiResponseFactory.FromResult(this, result);
    }
}
