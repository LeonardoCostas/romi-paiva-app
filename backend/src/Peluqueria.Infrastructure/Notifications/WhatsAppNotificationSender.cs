using System.Globalization;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Peluqueria.Application.Abstractions;
using Peluqueria.Application.Contracts.Notifications;

namespace Peluqueria.Infrastructure.Notifications;

public sealed class WhatsAppNotificationSender : INotificationSender
{
    private readonly HttpClient _httpClient;
    private readonly WhatsAppOptions _options;
    private readonly ILogger<WhatsAppNotificationSender> _logger;

    public WhatsAppNotificationSender(
        HttpClient httpClient,
        IOptions<WhatsAppOptions> options,
        ILogger<WhatsAppNotificationSender> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendReservationCreatedAsync(ReservationNotification notification, CancellationToken cancellationToken)
    {
        var message = BuildMessage(notification);

        if (!_options.Enabled || string.IsNullOrWhiteSpace(_options.PhoneNumberId) || string.IsNullOrWhiteSpace(_options.AccessToken))
        {
            _logger.LogInformation("WhatsApp dry-run to {Phone}: {Message}", notification.Phone, message);
            return;
        }

        var phone = NormalizeArgentinaPhone(notification.Phone);
        var url = $"https://graph.facebook.com/{_options.ApiVersion}/{_options.PhoneNumberId}/messages";
        var payload = string.IsNullOrWhiteSpace(_options.ReservationCreatedTemplateName)
            ? BuildTextPayload(phone, message)
            : BuildTemplatePayload(phone, notification);

        using var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.AccessToken);
        request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogWarning("WhatsApp send failed with {StatusCode}: {Body}", response.StatusCode, body);
        }
    }

    private static string BuildMessage(ReservationNotification notification)
    {
        var culture = CultureInfo.GetCultureInfo("es-AR");
        var date = notification.Date.ToDateTime(TimeOnly.MinValue).ToString("dddd d 'de' MMMM", culture);
        var start = notification.StartTime.ToString("HH:mm", culture);
        var end = notification.EndTime.ToString("HH:mm", culture);

        return $"Hola {notification.ClientFirstName}! Tu turno en Estetica Romi Paiva quedo solicitado para {date} de {start} a {end}. Servicio: {notification.ServiceName}. Te avisamos cuando este confirmado.";
    }

    private object BuildTextPayload(string phone, string message) => new
    {
        messaging_product = "whatsapp",
        to = phone,
        type = "text",
        text = new { preview_url = false, body = message },
    };

    private object BuildTemplatePayload(string phone, ReservationNotification notification)
    {
        var culture = CultureInfo.GetCultureInfo("es-AR");
        var date = notification.Date.ToDateTime(TimeOnly.MinValue).ToString("dddd d 'de' MMMM", culture);
        var start = notification.StartTime.ToString("HH:mm", culture);
        var end = notification.EndTime.ToString("HH:mm", culture);

        return new
        {
            messaging_product = "whatsapp",
            to = phone,
            type = "template",
            template = new
            {
                name = _options.ReservationCreatedTemplateName,
                language = new { code = _options.LanguageCode },
                components = new[]
                {
                    new
                    {
                        type = "body",
                        parameters = new[]
                        {
                            new { type = "text", text = notification.ClientFirstName },
                            new { type = "text", text = date },
                            new { type = "text", text = start },
                            new { type = "text", text = end },
                            new { type = "text", text = notification.ServiceName },
                        },
                    },
                },
            },
        };
    }

    private static string NormalizeArgentinaPhone(string phone)
    {
        var digits = new string(phone.Where(char.IsDigit).ToArray());

        if (digits.StartsWith("549", StringComparison.Ordinal))
        {
            return digits;
        }

        if (digits.StartsWith("54", StringComparison.Ordinal))
        {
            return $"549{digits[2..]}";
        }

        return $"549{digits}";
    }
}
