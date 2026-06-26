using Peluqueria.Domain.Enums;

namespace Peluqueria.Application.Contracts.Users;

public sealed record UserResponse(Guid Id, string FirstName, string LastName, string Email, UserRole Role, bool Active);
public sealed record CreateUserRequest(string FirstName, string LastName, string Email, string Password, UserRole Role);
public sealed record UpdateUserRequest(string FirstName, string LastName, UserRole Role);
public sealed record UpdateUserStatusRequest(bool Active);