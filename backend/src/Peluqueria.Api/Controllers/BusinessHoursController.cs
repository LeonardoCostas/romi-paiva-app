using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Peluqueria.Api.Common;
using Peluqueria.Application.Contracts.BusinessHours;
using Peluqueria.Application.Services;
using Peluqueria.Domain.Enums;

namespace Peluqueria.Api.Controllers;

[ApiController]
[Authorize(Roles = nameof(UserRole.Admin))]
[Route("api/v1/business-hours")]
public sealed class BusinessHoursController : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<BusinessHourResponse>>>> GetAll(
        [FromServices] BusinessHourService businessHourService,
        CancellationToken cancellationToken)
    {
        var items = await businessHourService.GetAllAsync(cancellationToken);
        return Ok(new ApiResponse<IReadOnlyList<BusinessHourResponse>>(true, items, null, null));
    }

    [HttpPut]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<BusinessHourResponse>>>> Update(
        [FromServices] BusinessHourService businessHourService,
        [FromBody] IReadOnlyList<UpdateBusinessHourRequest> request,
        CancellationToken cancellationToken)
    {
        var result = await businessHourService.UpdateAsync(request, cancellationToken);
        return ApiResponseFactory.FromResult(this, result);
    }
}
