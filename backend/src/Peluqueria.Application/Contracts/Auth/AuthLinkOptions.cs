namespace Peluqueria.Application.Contracts.Auth;

public sealed class AuthLinkOptions
{
    public const string SectionName = "Email";

    public string FrontendBaseUrl { get; init; } = "http://localhost:5173";
}
