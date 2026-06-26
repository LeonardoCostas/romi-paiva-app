namespace Peluqueria.Application.Contracts.Clients;

public sealed record ClientResponse(Guid Id, string FirstName, string LastName, string Phone, string? Email, DateOnly? BirthDate, string? Notes, bool Active);
public sealed record CreateClientRequest(string FirstName, string LastName, string Phone, string? Email, DateOnly? BirthDate, string? Notes);
public sealed record UpdateClientRequest(string FirstName, string LastName, string Phone, string? Email, DateOnly? BirthDate, string? Notes);
public sealed record UpsertMyClientProfileRequest(string FirstName, string LastName, string Phone, DateOnly? BirthDate, string? Notes);
public sealed record UpdateClientStatusRequest(bool Active);