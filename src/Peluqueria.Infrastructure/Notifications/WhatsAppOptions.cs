namespace Peluqueria.Infrastructure.Notifications;

public sealed class WhatsAppOptions
{
    public const string SectionName = "Notifications:WhatsApp";

    public bool Enabled { get; init; }
    public string PhoneNumberId { get; init; } = string.Empty;
    public string AccessToken { get; init; } = string.Empty;
    public string ApiVersion { get; init; } = "v20.0";
    public string ReservationCreatedTemplateName { get; init; } = string.Empty;
    public string LanguageCode { get; init; } = "es_AR";
}
