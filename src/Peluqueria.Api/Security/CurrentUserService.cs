using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Peluqueria.Application.Abstractions;
using Peluqueria.Domain.Enums;

namespace Peluqueria.Api.Security;

public sealed class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid UserId =>
        Guid.TryParse(_httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? _httpContextAccessor.HttpContext?.User.FindFirstValue("sub"), out var userId)
            ? userId
            : Guid.Empty;

    public string Email =>
        _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email)
        ?? _httpContextAccessor.HttpContext?.User.FindFirstValue(JwtRegisteredClaimNames.Email)
        ?? string.Empty;

    public UserRole Role =>
        Enum.TryParse<UserRole>(_httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Role), out var role)
            ? role
            : UserRole.Cliente;

    public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;
}