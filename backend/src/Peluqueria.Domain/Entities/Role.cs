using Peluqueria.Domain.Common;
using Peluqueria.Domain.Enums;

namespace Peluqueria.Domain.Entities;

public sealed class Role : BaseEntity
{
    private Role()
    {
    }

    public Role(UserRole code, string name, string description)
    {
        Code = code;
        Name = name;
        Description = description;
    }

    public UserRole Code { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
}