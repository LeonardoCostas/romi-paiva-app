namespace Peluqueria.Infrastructure.Security;

public sealed class GoogleAuthOptions
{
    public const string SectionName = "GoogleAuth";

    public string ClientId { get; init; } = string.Empty;
    public string[] AdminEmails { get; init; } = [];
}
