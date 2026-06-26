using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Peluqueria.Domain.Entities;

namespace Peluqueria.Infrastructure.Persistence.Configurations;

public sealed class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
{
    public void Configure(EntityTypeBuilder<Reservation> builder)
    {
        builder.ToTable("reservations");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Notes).HasMaxLength(1000);
        builder.HasIndex(x => x.Date);
        builder.HasIndex(x => x.ClientId);
        builder.HasIndex(x => new { x.Date, x.StartTime, x.EndTime });
    }
}