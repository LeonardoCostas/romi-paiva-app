using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Peluqueria.Api.Common;
using Peluqueria.Application.Contracts.Auth;
using Peluqueria.Application.Services;

namespace Peluqueria.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public sealed class AuthController : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Register(
        [FromServices] AuthService authService,
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var result = await authService.RegisterAsync(request, cancellationToken);
        return ApiResponseFactory.FromResult(this, result);
    }

    [AllowAnonymous]
    [HttpPost("google")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> GoogleLogin(
        [FromServices] AuthService authService,
        [FromBody] GoogleLoginRequest request,
        CancellationToken cancellationToken)
    {
        var result = await authService.LoginWithGoogleAsync(request, cancellationToken);
        return ApiResponseFactory.FromResult(this, result);
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Login(
        [FromServices] AuthService authService,
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var result = await authService.LoginAsync(request, cancellationToken);
        return ApiResponseFactory.FromResult(this, result);
    }
}
