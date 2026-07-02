using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Peluqueria.Application.Abstractions;
using Peluqueria.Application.Contracts.Auth;
using Peluqueria.Domain.Entities;
using Peluqueria.Domain.Enums;
using Peluqueria.Infrastructure.Persistence;

namespace Peluqueria.Infrastructure.Seeding;

public static class SeedData
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        var dbContext = serviceProvider.GetRequiredService<AppDbContext>();
        var passwordHasher = serviceProvider.GetRequiredService<IPasswordHasher>();
        var googleLoginOptions = serviceProvider.GetRequiredService<IOptions<GoogleLoginOptions>>().Value;

        if (!await dbContext.Roles.AnyAsync())
        {
            dbContext.Roles.AddRange(
                new Role(UserRole.Admin, "Admin", "Dueña del salón"),
                new Role(UserRole.Recepcionista, "Recepcionista", "Gestión operativa y agenda"),
                new Role(UserRole.Profesional, "Profesional", "Empleadas y estilistas"),
                new Role(UserRole.Cliente, "Cliente", "Cliente que reserva online"));
        }

        var configuredAdminEmails = googleLoginOptions.AdminEmails
            .Select(email => email.Trim().ToLowerInvariant())
            .Where(email => !string.IsNullOrWhiteSpace(email))
            .Distinct()
            .ToList();

        foreach (var adminEmail in configuredAdminEmails)
        {
            var adminUser = await dbContext.Users.FirstOrDefaultAsync(user => user.Email == adminEmail);
            if (adminUser is null)
            {
                dbContext.Users.Add(new User("Admin", "Autorizado", adminEmail, passwordHasher.Hash(Guid.NewGuid().ToString("N")), UserRole.Admin));
                continue;
            }

            if (adminUser.Role != UserRole.Admin)
            {
                adminUser.UpdateProfile(adminUser.FirstName, adminUser.LastName, UserRole.Admin);
            }

            if (!adminUser.Active)
            {
                adminUser.SetStatus(true);
            }

            if (!adminUser.EmailVerified)
            {
                adminUser.MarkEmailVerified();
            }
        }

        if (!await dbContext.BusinessHours.AnyAsync())
        {
            dbContext.BusinessHours.AddRange(
                new BusinessHour(DayOfWeek.Monday, new TimeOnly(9, 0), new TimeOnly(18, 0)),
                new BusinessHour(DayOfWeek.Tuesday, new TimeOnly(9, 0), new TimeOnly(18, 0)),
                new BusinessHour(DayOfWeek.Wednesday, new TimeOnly(9, 0), new TimeOnly(18, 0)),
                new BusinessHour(DayOfWeek.Thursday, new TimeOnly(9, 0), new TimeOnly(18, 0)),
                new BusinessHour(DayOfWeek.Friday, new TimeOnly(9, 0), new TimeOnly(18, 0)),
                new BusinessHour(DayOfWeek.Saturday, new TimeOnly(9, 0), new TimeOnly(14, 0)));
        }

        var existingServiceNames = await dbContext.Services
            .Select(service => service.Name.ToLower())
            .ToListAsync();

        var servicesToSeed = new[]
        {
            new Service("Lifting de Pestañas", null, ServiceCategory.Pestanias, 60, 15000m, false, EyelashServiceKind.None),
            new Service("Set Completo Clásico", null, ServiceCategory.Pestanias, 90, 25000m, false, EyelashServiceKind.SetCompleto),
            new Service("Set Completo Híbrido", null, ServiceCategory.Pestanias, 100, 30000m, false, EyelashServiceKind.SetCompleto),
            new Service("Set Completo 3D", null, ServiceCategory.Pestanias, 120, 35000m, false, EyelashServiceKind.SetCompleto),
            new Service("Efecto foxy", "Extensiones con efecto alargado para levantar y estilizar la mirada.", ServiceCategory.Pestanias, 120, 27000m, false, EyelashServiceKind.SetCompleto),
            new Service("Volumen tecnológico 2D", "Volumen 2D liviano con acabado prolijo y definido.", ServiceCategory.Pestanias, 120, 23000m, false, EyelashServiceKind.SetCompleto),
            new Service("Volumen tecnológico 3D/4D", "Volumen 3D/4D para una mirada más intensa y glam.", ServiceCategory.Pestanias, 140, 25000m, false, EyelashServiceKind.SetCompleto),
            new Service("Service de Pestañas", null, ServiceCategory.Pestanias, 45, 15000m, false, EyelashServiceKind.Service),
            new Service("Remoción", null, ServiceCategory.Pestanias, 30, 5000m, false, EyelashServiceKind.Remocion),
            new Service("Remoción + Set Completo Clásico", null, ServiceCategory.Pestanias, 120, 28000m, false, EyelashServiceKind.RemocionYSetCompleto),
            new Service("Corte", "Corte femenino, mantenimiento de puntas o cambio de estilo.", ServiceCategory.Peluqueria, 45, null, true, EyelashServiceKind.None),
            new Service("Color", "Coloración completa, retoque de raíz o baño de color según diagnóstico.", ServiceCategory.Peluqueria, 120, null, true, EyelashServiceKind.None),
            new Service("Mechas", "Iluminación, reflejos o mechas personalizadas según base y objetivo.", ServiceCategory.Peluqueria, 180, null, true, EyelashServiceKind.None),
            new Service("Alisado", "Alisado progresivo o tratamiento disciplinante para controlar frizz.", ServiceCategory.Peluqueria, 180, null, true, EyelashServiceKind.None),
            new Service("Peinados", "Peinados para eventos, brushing, ondas o recogidos.", ServiceCategory.Peluqueria, 60, null, true, EyelashServiceKind.None),
            new Service("Shock de queratina", "Tratamiento reparador para brillo, suavidad y control del volumen.", ServiceCategory.Peluqueria, 120, null, true, EyelashServiceKind.None),
            new Service("Tratamientos de nutrición", "Nutrición profunda personalizada para recuperar suavidad y vitalidad.", ServiceCategory.Peluqueria, 90, null, true, EyelashServiceKind.None),
        };

        dbContext.Services.AddRange(
            servicesToSeed.Where(service => !existingServiceNames.Contains(service.Name.ToLower())));

        var nailServices = await dbContext.Services
            .Where(service => service.Category == ServiceCategory.Unias)
            .ToListAsync();

        foreach (var service in nailServices)
        {
            service.SetStatus(false);
        }

        await dbContext.SaveChangesAsync();
    }
}
