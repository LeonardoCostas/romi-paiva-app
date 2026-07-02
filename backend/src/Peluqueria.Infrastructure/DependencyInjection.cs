using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Peluqueria.Application.Abstractions;
using Peluqueria.Application.Contracts.Auth;
using Peluqueria.Application.Services;
using Peluqueria.Domain.Repositories;
using Peluqueria.Infrastructure.Notifications;
using Peluqueria.Infrastructure.Persistence;
using Peluqueria.Infrastructure.Repositories;
using Peluqueria.Infrastructure.Security;

namespace Peluqueria.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.Configure<GoogleAuthOptions>(configuration.GetSection(GoogleAuthOptions.SectionName));
        services.Configure<GoogleLoginOptions>(configuration.GetSection(GoogleLoginOptions.SectionName));
        services.Configure<AuthLinkOptions>(configuration.GetSection(AuthLinkOptions.SectionName));
        services.Configure<WhatsAppOptions>(configuration.GetSection(WhatsAppOptions.SectionName));
        services.Configure<EmailOptions>(configuration.GetSection(EmailOptions.SectionName));
        services.AddDbContext<AppDbContext>(options =>
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                connectionString = "Data Source=peluqueria-dev.db";
            }

            if (connectionString.TrimStart().StartsWith("Data Source=", StringComparison.OrdinalIgnoreCase))
            {
                options.UseSqlite(connectionString);
            }
            else
            {
                options.UseNpgsql(connectionString);
            }
        });

        services.AddScoped<IUnitOfWork>(provider => provider.GetRequiredService<AppDbContext>());
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IClientRepository, ClientRepository>();
        services.AddScoped<IServiceRepository, ServiceRepository>();
        services.AddScoped<IReservationRepository, ReservationRepository>();
        services.AddScoped<IBusinessHourRepository, BusinessHourRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();

        services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IGoogleTokenValidator, GoogleTokenValidator>();
        services.AddScoped<IEmailSender, SmtpEmailSender>();
        services.AddHttpClient<INotificationSender, WhatsAppNotificationSender>();

        services.AddScoped<AuthService>();
        services.AddScoped<UserService>();
        services.AddScoped<ClientService>();
        services.AddScoped<ServiceCatalogService>();
        services.AddScoped<BusinessHourService>();
        services.AddScoped<ReservationService>();

        return services;
    }
}
