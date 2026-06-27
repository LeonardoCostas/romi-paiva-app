using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Peluqueria.Api.Common;
using Peluqueria.Application.Contracts.Services;
using Peluqueria.Application.Services;
using Peluqueria.Domain.Enums;

namespace Peluqueria.Api.Controllers;

[ApiController]
[Authorize(Roles = nameof(UserRole.Admin))]
[Route("api/v1/services")]
public sealed class ServicesController : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ServiceResponse>>>> GetAll(
        [FromServices] ServiceCatalogService serviceCatalogService,
        [FromQuery] bool? active,
        CancellationToken cancellationToken)
    {
        var services = await serviceCatalogService.GetAllAsync(active, cancellationToken);
        return Ok(new ApiResponse<IReadOnlyList<ServiceResponse>>(true, services, null, null));
    }

    [AllowAnonymous]
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ServiceResponse>>> GetById(
        Guid id,
        [FromServices] ServiceCatalogService serviceCatalogService,
        CancellationToken cancellationToken)
    {
        var result = await serviceCatalogService.GetByIdAsync(id, cancellationToken);
        return ApiResponseFactory.FromResult(this, result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ServiceResponse>>> Create(
        [FromServices] ServiceCatalogService serviceCatalogService,
        [FromBody] CreateServiceRequest request,
        CancellationToken cancellationToken)
    {
        var result = await serviceCatalogService.CreateAsync(request, cancellationToken);
        return ApiResponseFactory.FromResult(this, result, StatusCodes.Status201Created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ServiceResponse>>> Update(
        Guid id,
        [FromServices] ServiceCatalogService serviceCatalogService,
        [FromBody] UpdateServiceRequest request,
        CancellationToken cancellationToken)
    {
        var result = await serviceCatalogService.UpdateAsync(id, request, cancellationToken);
        return ApiResponseFactory.FromResult(this, result);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<ApiResponse<ServiceResponse>>> UpdateStatus(
        Guid id,
        [FromServices] ServiceCatalogService serviceCatalogService,
        [FromBody] UpdateServiceStatusRequest request,
        CancellationToken cancellationToken)
    {
        var result = await serviceCatalogService.UpdateStatusAsync(id, request.Active, cancellationToken);
        return ApiResponseFactory.FromResult(this, result);
    }
}
