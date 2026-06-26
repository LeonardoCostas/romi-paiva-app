using Peluqueria.Domain.Common;

namespace Peluqueria.Domain.Entities;

public sealed class Client : BaseEntity
{
    private Client()
    {
    }

    public Client(string firstName, string lastName, string phone, string? email, DateOnly? birthDate, string? notes, bool active = true)
    {
        FirstName = firstName;
        LastName = lastName;
        Phone = phone;
        Email = email?.Trim().ToLowerInvariant();
        BirthDate = birthDate;
        Notes = notes;
        Active = active;
    }

    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string Phone { get; private set; } = string.Empty;
    public string? Email { get; private set; }
    public DateOnly? BirthDate { get; private set; }
    public string? Notes { get; private set; }
    public bool Active { get; private set; }

    public void Update(string firstName, string lastName, string phone, string? email, DateOnly? birthDate, string? notes)
    {
        FirstName = firstName;
        LastName = lastName;
        Phone = phone;
        Email = email?.Trim().ToLowerInvariant();
        BirthDate = birthDate;
        Notes = notes;
        Touch();
    }

    public void SetStatus(bool active)
    {
        Active = active;
        Touch();
    }
}