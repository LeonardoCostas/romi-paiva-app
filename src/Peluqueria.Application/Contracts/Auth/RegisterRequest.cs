namespace Peluqueria.Application.Contracts.Auth;

public sealed record RegisterRequest(string FirstName, string LastName, string Phone, string Email, string Password);
