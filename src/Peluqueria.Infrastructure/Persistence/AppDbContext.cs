using Microsoft.EntityFrameworkCore;
using Peluqueria.Domain.Entities;
using Peluqueria.Domain.Repositories;

namespace Peluqueria.Infrastructure.Persistence;

public sealed class AppDbContext : DbContext, IUnitOfWork
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<BusinessHour> BusinessHours => Set<BusinessHour>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}