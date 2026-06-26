using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Peluqueria.Api.Common;
using Peluqueria.Application.Contracts.Users;
using Peluqueria.Application.Services;
using Peluqueria.Domain.Enums;

namespace Peluqueria.Api.Controllers;

[ApiController]
[Authorize(Roles = $"{nameof(UserRole.Admin)}")]
[Route("api/v1/users")]
public sealed class UsersController : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<UserResponse>>>> GetAll(
        [FromServices] UserService userService,
        CancellationToken cancellationToken)
    {
        var users = await userService.GetAllAsync(cancellationToken);
        return Ok(new ApiResponse<IReadOnlyList<UserResponse>>(true, users, null, null));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<UserResponse>>> Create(
        [FromServices] UserService userService,
        [FromBody] CreateUserRequest request,
        CancellationToken cancellationToken)
    {
        var result = await userService.CreateAsync(request, cancellationToken);
        return ApiResponseFactory.FromResult(this, result, StatusCodes.Status201Created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<UserResponse>>> Update(
        Guid id,
        [FromServices] UserService userService,
        [FromBody] UpdateUserRequest request,
        CancellationToken cancellationToken)
    {
        var result = await userService.UpdateAsync(id, request, cancellationToken);
        return ApiResponseFactory.FromResult(this, result);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<ApiResponse<UserResponse>>> UpdateStatus(
        Guid id,
        [FromServices] UserService userService,
        [FromBody] UpdateUserStatusRequest request,
        CancellationToken cancellationToken)
    {
        var result = await userService.UpdateStatusAsync(id, request.Active, cancellationToken);
        return ApiResponseFactory.FromResult(this, result);
    }
}