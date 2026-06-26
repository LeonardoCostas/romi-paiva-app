using Peluqueria.Application.Abstractions;
using Peluqueria.Application.Common;
using Peluqueria.Application.Contracts.Auth;
using Peluqueria.Domain.Entities;
using Peluqueria.Domain.Enums;
using Peluqueria.Domain.Repositories;
using Microsoft.Extensions.Options;

namespace Peluqueria.Application.Services;

public sealed class AuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IClientRepository _clientRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IGoogleTokenValidator _googleTokenValidator;
    private readonly GoogleLoginOptions _googleLoginOptions;

    public AuthService(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IClientRepository clientRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        IGoogleTokenValidator googleTokenValidator,
        IOptions<GoogleLoginOptions> googleLoginOptions)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _clientRepository = clientRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _googleTokenValidator = googleTokenValidator;
        _googleLoginOptions = googleLoginOptions.Value;
    }

    public async Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        var firstName = request.FirstName.Trim();
        var lastName = request.LastName.Trim();
        var phone = request.Phone.Trim();
        var email = request.Email.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(firstName) ||
            string.IsNullOrWhiteSpace(lastName) ||
            string.IsNullOrWhiteSpace(phone) ||
            string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return Result<AuthResponse>.Fail("Completá todos los datos para registrarte.");
        }

        if (request.Password.Length < 6)
        {
            return Result<AuthResponse>.Fail("La contraseña debe tener al menos 6 caracteres.");
        }

        var existingUser = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (existingUser is not null)
        {
            return Result<AuthResponse>.Fail("Ya existe una cuenta con ese email.");
        }

        var user = new User(firstName, lastName, email, _passwordHasher.Hash(request.Password), UserRole.Cliente);
        await _userRepository.AddAsync(user, cancellationToken);

        var client = await _clientRepository.GetByEmailAsync(email, cancellationToken);
        if (client is null)
        {
            await _clientRepository.AddAsync(new Client(firstName, lastName, phone, email, null, null), cancellationToken);
        }
        else
        {
            client.Update(firstName, lastName, phone, email, client.BirthDate, client.Notes);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var token = _jwtTokenGenerator.Generate(user);
        return Result<AuthResponse>.Ok(new AuthResponse(user.Id, $"{user.FirstName} {user.LastName}", user.Email, user.Role, token));
    }

    public async Task<Result<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email.Trim().ToLowerInvariant(), cancellationToken);
        if (user is null || !user.Active || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return Result<AuthResponse>.Fail("Credenciales inválidas.");
        }

        var token = _jwtTokenGenerator.Generate(user);
        return Result<AuthResponse>.Ok(new AuthResponse(user.Id, $"{user.FirstName} {user.LastName}", user.Email, user.Role, token));
    }

    public async Task<Result<AuthResponse>> LoginWithGoogleAsync(GoogleLoginRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.IdToken))
        {
            return Result<AuthResponse>.Fail("El token de Google es requerido.");
        }

        var googleUser = await _googleTokenValidator.ValidateAsync(request.IdToken, cancellationToken);
        if (googleUser is null)
        {
            return Result<AuthResponse>.Fail("Token de Google inválido.");
        }

        var normalizedEmail = googleUser.Email.Trim().ToLowerInvariant();
        var user = await _userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);
        var shouldBeAdmin = _googleLoginOptions.AdminEmails.Any(email => string.Equals(email.Trim(), normalizedEmail, StringComparison.OrdinalIgnoreCase));
        if (!shouldBeAdmin)
        {
            var users = await _userRepository.GetAllAsync(cancellationToken);
            shouldBeAdmin = !users.Any(existing =>
                existing.Role == UserRole.Admin &&
                !string.Equals(existing.Email, "admin@peluqueria.local", StringComparison.OrdinalIgnoreCase));
        }

        if (user is null)
        {
            var firstName = string.IsNullOrWhiteSpace(googleUser.FirstName) ? "Google" : googleUser.FirstName.Trim();
            var lastName = string.IsNullOrWhiteSpace(googleUser.LastName) ? "User" : googleUser.LastName.Trim();
            user = new User(firstName, lastName, normalizedEmail, string.Empty, shouldBeAdmin ? UserRole.Admin : UserRole.Cliente);
            await _userRepository.AddAsync(user, cancellationToken);
        }
        else if (shouldBeAdmin && user.Role != UserRole.Admin)
        {
            user.UpdateProfile(user.FirstName, user.LastName, UserRole.Admin);
        }

        if (user.Role == UserRole.Cliente)
        {
            var client = await _clientRepository.GetByEmailAsync(normalizedEmail, cancellationToken);
            if (client is null)
            {
                await _clientRepository.AddAsync(new Client(user.FirstName, user.LastName, string.Empty, normalizedEmail, null, null), cancellationToken);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        if (!user.Active)
        {
            return Result<AuthResponse>.Fail("El usuario se encuentra inactivo.");
        }

        var token = _jwtTokenGenerator.Generate(user);
        return Result<AuthResponse>.Ok(new AuthResponse(user.Id, $"{user.FirstName} {user.LastName}", user.Email, user.Role, token));
    }
}
