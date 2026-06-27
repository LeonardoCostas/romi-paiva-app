using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Peluqueria.Api.Security;
using Peluqueria.Application.Abstractions;
using Peluqueria.Domain.Repositories;
using Peluqueria.Infrastructure;
using Peluqueria.Infrastructure.Security;

namespace Peluqueria.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddInfrastructure(configuration);
        services.AddControllers();
        services.AddOpenApi();

        var jwtOptions = configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtOptions.Issuer,
                    ValidAudience = jwtOptions.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SecretKey)),
                    ClockSkew = TimeSpan.FromMinutes(2),
                };
                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = async context =>
                    {
                        var principal = context.Principal;
                        var identity = principal?.Identity as ClaimsIdentity;
                        if (principal is null || identity is null)
                        {
                            context.Fail("Acceso denegado.");
                            return;
                        }

                        var rawUserId = principal.FindFirstValue(ClaimTypes.NameIdentifier)
                            ?? principal.FindFirstValue(JwtRegisteredClaimNames.Sub)
                            ?? principal.FindFirstValue("sub");

                        if (!Guid.TryParse(rawUserId, out var userId))
                        {
                            context.Fail("Acceso denegado.");
                            return;
                        }

                        var userRepository = context.HttpContext.RequestServices.GetRequiredService<IUserRepository>();
                        var user = await userRepository.GetByIdAsync(userId, context.HttpContext.RequestAborted);
                        if (user is null || !user.Active)
                        {
                            context.Fail("Acceso denegado.");
                            return;
                        }

                        var tokenEmail = principal.FindFirstValue(ClaimTypes.Email)
                            ?? principal.FindFirstValue(JwtRegisteredClaimNames.Email);

                        if (!string.IsNullOrWhiteSpace(tokenEmail) &&
                            !string.Equals(tokenEmail.Trim(), user.Email, StringComparison.OrdinalIgnoreCase))
                        {
                            context.Fail("Acceso denegado.");
                            return;
                        }

                        ReplaceClaim(identity, ClaimTypes.NameIdentifier, user.Id.ToString());
                        ReplaceClaim(identity, ClaimTypes.Email, user.Email);
                        ReplaceClaim(identity, ClaimTypes.Name, $"{user.FirstName} {user.LastName}");
                        ReplaceClaim(identity, ClaimTypes.Role, user.Role.ToString());
                    }
                };
            });

        services.AddAuthorization();
        return services;
    }

    private static void ReplaceClaim(ClaimsIdentity identity, string type, string value)
    {
        foreach (var claim in identity.FindAll(type).ToList())
        {
            identity.RemoveClaim(claim);
        }

        identity.AddClaim(new Claim(type, value));
    }
}
