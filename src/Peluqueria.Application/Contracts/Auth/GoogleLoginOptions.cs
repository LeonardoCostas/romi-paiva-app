namespace Peluqueria.Application.Contracts.Auth;

public sealed class GoogleLoginOptions
{
    public const string SectionName = "GoogleAuth";

    public string[] AdminEmails { get; init; } = [];
}
