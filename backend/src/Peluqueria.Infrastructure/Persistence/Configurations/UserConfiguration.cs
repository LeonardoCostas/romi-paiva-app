using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Peluqueria.Domain.Entities;

namespace Peluqueria.Infrastructure.Persistence.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.FirstName).HasMaxLength(100).IsRequired();
        builder.Property(x => x.LastName).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Email).HasMaxLength(200).IsRequired();
        builder.Property(x => x.PasswordHash).HasMaxLength(500).IsRequired();
        builder.Property(x => x.EmailVerificationTokenHash).HasMaxLength(128);
        builder.Property(x => x.PasswordResetTokenHash).HasMaxLength(128);
        builder.HasIndex(x => x.Email).IsUnique();
        builder.HasIndex(x => x.EmailVerificationTokenHash);
        builder.HasIndex(x => x.PasswordResetTokenHash);
    }
}
