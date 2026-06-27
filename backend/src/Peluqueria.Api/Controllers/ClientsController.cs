using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Peluqueria.Api.Common;
using Peluqueria.Application.Contracts.Clients;
using Peluqueria.Application.Services;
using Peluqueria.Domain.Enums;

namespace Peluqueria.Api.Controllers;

[ApiController]
[Route("api/v1/clients")]
public sealed class ClientsController : ControllerBase
{
    [Authorize(Roles = nameof(UserRole.Admin))]
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ClientResponse>>>> GetAll(
        [FromServices] ClientService clientService,
        [FromQuery] string? search,
        [FromQuery] bool? active,
        CancellationToken cancellationToken)
    {
        var clients = await clientService.GetAllAsync(search, active, cancellationToken);
        return Ok(new ApiResponse<IReadOnlyList<ClientResponse>>(true, clients, null, null));
    }

    [Authorize(Roles = nameof(UserRole.Admin))]
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ClientResponse>>> GetById(
        Guid id,
        [FromServices] ClientService clientService,
        CancellationToken cancellationToken)
    {
        var result = await clientService.GetByIdAsync(id, cancellationToken);
        return ApiResponseFactory.FromResult(this, result);
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ClientResponse>>> Create(
        [FromServices] ClientService clientService,
        [FromBody] CreateClientRequest request,
        CancellationToken cancellationToken)
    {
        var result = await clientService.CreateAsync(request, cancellationToken);
        return ApiResponseFactory.FromResult(this, result, StatusCodes.Status201Created);
    }

    [Authorize(Roles = nameof(UserRole.Cliente))]
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<ClientResponse>>> GetMyProfile(
        [FromServices] ClientService clientService,
        CancellationToken cancellationToken)
    {
        var result = await clientService.GetMyProfileAsync(cancellationToken);
        return ApiResponseFactory.FromResult(this, result);
    }

    [Authorize(Roles = nameof(UserRole.Cliente))]
    [HttpPut("me")]
    public async Task<ActionResult<ApiResponse<ClientResponse>>> UpsertMyProfile(
        [FromServices] ClientService clientService,
        [FromBody] UpsertMyClientProfileRequest request,
        CancellationToken cancellationToken)
    {
        var result = await clientService.UpsertMyProfileAsync(request, cancellationToken);
        return ApiResponseFactory.FromResult(this, result);
    }

    [Authorize(Roles = nameof(UserRole.Admin))]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ClientResponse>>> Update(
        Guid id,
        [FromServices] ClientService clientService,
        [FromBody] UpdateClientRequest request,
        CancellationToken cancellationToken)
    {
        var result = await clientService.UpdateAsync(id, request, cancellationToken);
        return ApiResponseFactory.FromResult(this, result);
    }

    [Authorize(Roles = nameof(UserRole.Admin))]
    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<ApiResponse<ClientResponse>>> UpdateStatus(
        Guid id,
        [FromServices] ClientService clientService,
        [FromBody] UpdateClientStatusRequest request,
        CancellationToken cancellationToken)
    {
        var result = await clientService.UpdateStatusAsync(id, request.Active, cancellationToken);
        return ApiResponseFactory.FromResult(this, result);
    }
}
