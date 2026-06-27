using Peluqueria.Application.Abstractions;
using Peluqueria.Application.Common;
using Peluqueria.Application.Contracts.Clients;
using Peluqueria.Domain.Entities;
using Peluqueria.Domain.Enums;
using Peluqueria.Domain.Repositories;

namespace Peluqueria.Application.Services;

public sealed class ClientService
{
    private readonly IClientRepository _clientRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public ClientService(IClientRepository clientRepository, IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _clientRepository = clientRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<IReadOnlyList<ClientResponse>> GetAllAsync(string? search, bool? active, CancellationToken cancellationToken)
    {
        var clients = await _clientRepository.GetAllAsync(search, active, cancellationToken);
        return clients.Select(Map).ToList();
    }

    public async Task<Result<ClientResponse>> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var client = await _clientRepository.GetByIdAsync(id, cancellationToken);
        return client is null ? Result<ClientResponse>.Fail("Cliente no encontrado.") : Result<ClientResponse>.Ok(Map(client));
    }

    public async Task<Result<ClientResponse>> CreateAsync(CreateClientRequest request, CancellationToken cancellationToken)
    {
        var client = new Client(request.FirstName, request.LastName, request.Phone, request.Email, request.BirthDate, request.Notes);
        await _clientRepository.AddAsync(client, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<ClientResponse>.Ok(Map(client));
    }

    public async Task<Result<ClientResponse>> UpdateAsync(Guid id, UpdateClientRequest request, CancellationToken cancellationToken)
    {
        var client = await _clientRepository.GetByIdAsync(id, cancellationToken);
        if (client is null)
        {
            return Result<ClientResponse>.Fail("Cliente no encontrado.");
        }

        client.Update(request.FirstName, request.LastName, request.Phone, request.Email, request.BirthDate, request.Notes);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<ClientResponse>.Ok(Map(client));
    }

    public async Task<Result<ClientResponse>> UpdateStatusAsync(Guid id, bool active, CancellationToken cancellationToken)
    {
        var client = await _clientRepository.GetByIdAsync(id, cancellationToken);
        if (client is null)
        {
            return Result<ClientResponse>.Fail("Cliente no encontrado.");
        }

        client.SetStatus(active);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<ClientResponse>.Ok(Map(client));
    }

    public async Task<Result<ClientResponse>> GetMyProfileAsync(CancellationToken cancellationToken)
    {
        var client = await GetCurrentClientAsync(cancellationToken);
        return client is null
            ? Result<ClientResponse>.Fail("Perfil de cliente no encontrado.")
            : Result<ClientResponse>.Ok(Map(client));
    }

    public async Task<Result<ClientResponse>> UpsertMyProfileAsync(UpsertMyClientProfileRequest request, CancellationToken cancellationToken)
    {
        var email = NormalizeEmail(_currentUserService.Email);
        if (string.IsNullOrEmpty(email))
        {
            return Result<ClientResponse>.Fail("No se pudo determinar el email del usuario autenticado.");
        }

        var existing = await _clientRepository.GetByEmailAsync(email, cancellationToken);
        if (existing is not null && !existing.LinkToUser(_currentUserService.UserId))
        {
            return Result<ClientResponse>.Fail("Ya existe un perfil de cliente asociado a otro usuario.");
        }

        if (existing is null)
        {
            var client = new Client(request.FirstName, request.LastName, request.Phone, email, request.BirthDate, request.Notes, _currentUserService.UserId);
            await _clientRepository.AddAsync(client, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<ClientResponse>.Ok(Map(client));
        }

        existing.Update(request.FirstName, request.LastName, request.Phone, email, request.BirthDate, request.Notes);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<ClientResponse>.Ok(Map(existing));
    }

    private async Task<Client?> GetCurrentClientAsync(CancellationToken cancellationToken)
    {
        var email = NormalizeEmail(_currentUserService.Email);
        if (_currentUserService.UserId != Guid.Empty)
        {
            var clientByUserId = await _clientRepository.GetByUserIdAsync(_currentUserService.UserId, cancellationToken);
            if (clientByUserId is not null)
            {
                return clientByUserId;
            }
        }

        if (string.IsNullOrEmpty(email))
        {
            return null;
        }

        var clientByEmail = await _clientRepository.GetByEmailAsync(email, cancellationToken);
        if (clientByEmail is not null && clientByEmail.UserId is null && _currentUserService.UserId != Guid.Empty)
        {
            clientByEmail.LinkToUser(_currentUserService.UserId);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return clientByEmail;
    }

    private static string NormalizeEmail(string? email) => email?.Trim().ToLowerInvariant() ?? string.Empty;

    private static ClientResponse Map(Client client) => new(client.Id, client.FirstName, client.LastName, client.Phone, client.Email, client.BirthDate, client.Notes, client.Active);
}
