using Peluqueria.Domain.Common;
using Peluqueria.Domain.Enums;

namespace Peluqueria.Domain.Entities;

public sealed class User : BaseEntity
{
    private User()
    {
    }

    public User(string firstName, string lastName, string email, string passwordHash, UserRole role, bool active = true)
    {
        FirstName = firstName;
        LastName = lastName;
        Email = email.Trim().ToLowerInvariant();
        PasswordHash = passwordHash;
        Role = role;
        Active = active;
    }

    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public UserRole Role { get; private set; }
    public bool Active { get; private set; }

    public void UpdateProfile(string firstName, string lastName, UserRole role)
    {
        FirstName = firstName;
        LastName = lastName;
        Role = role;
        Touch();
    }

    public void UpdatePassword(string passwordHash)
    {
        PasswordHash = passwordHash;
        Touch();
    }

    public void SetStatus(bool active)
    {
        Active = active;
        Touch();
    }
}