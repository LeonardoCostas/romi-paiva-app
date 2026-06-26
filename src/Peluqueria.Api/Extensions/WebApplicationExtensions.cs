using Microsoft.EntityFrameworkCore;
using Peluqueria.Infrastructure.Persistence;
using Peluqueria.Infrastructure.Seeding;

namespace Peluqueria.Api.Extensions;

public static class WebApplicationExtensions
{
    public static async Task<WebApplication> ConfigurePipelineAsync(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            // Cambiado a la sintaxis nativa de .NET 10 para evitar el choque con Swashbuckle
            app.MapOpenApi();
        }

        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        if (dbContext.Database.IsSqlite())
        {
            await dbContext.Database.EnsureCreatedAsync();
        }
        else
        {
            await dbContext.Database.MigrateAsync();
        }
        await SeedData.InitializeAsync(scope.ServiceProvider);

        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();

        return app;
    }
}
