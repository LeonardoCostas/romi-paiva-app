using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Peluqueria.Domain.Entities;

namespace Peluqueria.Infrastructure.Persistence.Configurations;

public sealed class BusinessHourConfiguration : IEntityTypeConfiguration<BusinessHour>
{
    public void Configure(EntityTypeBuilder<BusinessHour> builder)
    {
        builder.ToTable("business_hours");
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => x.DayOfWeek).IsUnique();
    }
}