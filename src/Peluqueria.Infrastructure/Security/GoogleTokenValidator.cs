using Google.Apis.Auth;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Peluqueria.Application.Abstractions;

namespace Peluqueria.Infrastructure.Security;

public sealed class GoogleTokenValidator : IGoogleTokenValidator
{
    private readonly GoogleAuthOptions _options;
    private readonly ILogger<GoogleTokenValidator> _logger;

    public GoogleTokenValidator(IOptions<GoogleAuthOptions> options, ILogger<GoogleTokenValidator> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task<GoogleUserInfo?> ValidateAsync(string idToken, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(idToken))
        {
            _logger.LogWarning("Google login failed: empty id token.");
            return null;
        }

        if (string.IsNullOrWhiteSpace(_options.ClientId))
        {
            _logger.LogWarning("Google login failed: GoogleAuth:ClientId is not configured.");
            return null;
        }

        try
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(
                idToken,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _options.ClientId },
                    IssuedAtClockTolerance = TimeSpan.FromMinutes(5),
                });

            return string.IsNullOrWhiteSpace(payload.Email)
                ? null
                : new GoogleUserInfo(payload.Email, payload.GivenName ?? string.Empty, payload.FamilyName ?? string.Empty);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Google token validation failed.");
            return null;
        }
    }
}
