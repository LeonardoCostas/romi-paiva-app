using Peluqueria.Domain.Enums;

namespace Peluqueria.Application.Contracts.Auth;

public sealed record AuthResponse(Guid UserId, string FullName, string Email, UserRole Role, string Token);