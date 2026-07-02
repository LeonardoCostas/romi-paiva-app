namespace Peluqueria.Application.Contracts.Auth;

public sealed record ResetPasswordRequest(string Token, string Password);
