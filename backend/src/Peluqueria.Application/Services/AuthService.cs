using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Peluqueria.Application.Abstractions;
using Peluqueria.Application.Common;
using Peluqueria.Application.Contracts.Auth;
using Peluqueria.Domain.Entities;
using Peluqueria.Domain.Enums;
using Peluqueria.Domain.Repositories;

namespace Peluqueria.Application.Services;

public sealed class AuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IClientRepository _clientRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IGoogleTokenValidator _googleTokenValidator;
    private readonly IEmailSender _emailSender;
    private readonly AuthLinkOptions _authLinkOptions;

    public AuthService(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IClientRepository clientRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        IGoogleTokenValidator googleTokenValidator,
        IEmailSender emailSender,
        IOptions<AuthLinkOptions> authLinkOptions)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _clientRepository = clientRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _googleTokenValidator = googleTokenValidator;
        _emailSender = emailSender;
        _authLinkOptions = authLinkOptions.Value;
    }

    public async Task<Result<AuthMessageResponse>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
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
            return Result<AuthMessageResponse>.Fail("Completa todos los datos para registrarte.");
        }

        if (request.Password.Length < 6)
        {
            return Result<AuthMessageResponse>.Fail("La contrasena debe tener al menos 6 caracteres.");
        }

        var existingUser = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (existingUser is not null)
        {
            return Result<AuthMessageResponse>.Fail("Ya existe una cuenta con ese email.");
        }

        var verificationToken = GenerateToken();
        var user = new User(firstName, lastName, email, _passwordHasher.Hash(request.Password), UserRole.Cliente);
        user.RequireEmailVerification(HashToken(verificationToken), DateTime.UtcNow.AddHours(24));
        await _userRepository.AddAsync(user, cancellationToken);

        var client = await _clientRepository.GetByEmailAsync(email, cancellationToken);
        if (client is null)
        {
            await _clientRepository.AddAsync(new Client(firstName, lastName, phone, email, null, null, user.Id), cancellationToken);
        }
        else
        {
            if (!client.LinkToUser(user.Id))
            {
                return Result<AuthMessageResponse>.Fail("Ya existe un perfil de cliente asociado a otro usuario.");
            }

            client.Update(firstName, lastName, phone, email, client.BirthDate, client.Notes);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await SendVerificationEmailAsync(user, verificationToken, cancellationToken);

        return Result<AuthMessageResponse>.Ok(new AuthMessageResponse("Te enviamos un email para confirmar tu cuenta antes de iniciar sesion."));
    }

    public async Task<Result<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email.Trim().ToLowerInvariant(), cancellationToken);
        if (user is null || !user.Active || string.IsNullOrWhiteSpace(user.PasswordHash) || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return Result<AuthResponse>.Fail("Credenciales invalidas.");
        }

        if (!user.EmailVerified)
        {
            return Result<AuthResponse>.Fail("Tenes que confirmar tu email antes de iniciar sesion.");
        }

        var token = _jwtTokenGenerator.Generate(user);
        return Result<AuthResponse>.Ok(new AuthResponse(user.Id, $"{user.FirstName} {user.LastName}", user.Email, user.Role, token));
    }

    public async Task<Result<AuthMessageResponse>> VerifyEmailAsync(VerifyEmailRequest request, CancellationToken cancellationToken)
    {
        var tokenHash = HashToken(request.Token);
        var user = await _userRepository.GetByEmailVerificationTokenHashAsync(tokenHash, cancellationToken);
        if (user is null || !user.HasValidEmailVerificationToken(tokenHash, DateTime.UtcNow))
        {
            return Result<AuthMessageResponse>.Fail("El enlace de confirmacion no es valido o ya vencio.");
        }

        user.MarkEmailVerified();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<AuthMessageResponse>.Ok(new AuthMessageResponse("Email confirmado. Ya podes iniciar sesion."));
    }

    public async Task<Result<AuthMessageResponse>> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (user is not null && user.Active)
        {
            var resetToken = GenerateToken();
            user.SetPasswordResetToken(HashToken(resetToken), DateTime.UtcNow.AddHours(1));
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await SendPasswordResetEmailAsync(user, resetToken, cancellationToken);
        }

        return Result<AuthMessageResponse>.Ok(new AuthMessageResponse("Si el email esta registrado, te enviamos un enlace para restablecer la contrasena."));
    }

    public async Task<Result<AuthMessageResponse>> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
        {
            return Result<AuthMessageResponse>.Fail("La contrasena debe tener al menos 6 caracteres.");
        }

        var tokenHash = HashToken(request.Token);
        var user = await _userRepository.GetByPasswordResetTokenHashAsync(tokenHash, cancellationToken);
        if (user is null || !user.HasValidPasswordResetToken(tokenHash, DateTime.UtcNow))
        {
            return Result<AuthMessageResponse>.Fail("El enlace para restablecer la contrasena no es valido o ya vencio.");
        }

        user.UpdatePassword(_passwordHasher.Hash(request.Password));
        user.MarkEmailVerified();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<AuthMessageResponse>.Ok(new AuthMessageResponse("Contrasena actualizada. Ya podes iniciar sesion."));
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
            return Result<AuthResponse>.Fail("Token de Google invalido.");
        }

        var normalizedEmail = googleUser.Email.Trim().ToLowerInvariant();
        var user = await _userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);

        if (user is null)
        {
            var firstName = string.IsNullOrWhiteSpace(googleUser.FirstName) ? "Google" : googleUser.FirstName.Trim();
            var lastName = string.IsNullOrWhiteSpace(googleUser.LastName) ? "User" : googleUser.LastName.Trim();
            user = new User(firstName, lastName, normalizedEmail, string.Empty, UserRole.Cliente);
            await _userRepository.AddAsync(user, cancellationToken);
        }
        else if (!user.EmailVerified)
        {
            user.MarkEmailVerified();
        }

        if (user.Role == UserRole.Cliente)
        {
            var client = await _clientRepository.GetByUserIdAsync(user.Id, cancellationToken)
                ?? await _clientRepository.GetByEmailAsync(normalizedEmail, cancellationToken);

            if (client is null)
            {
                await _clientRepository.AddAsync(new Client(user.FirstName, user.LastName, string.Empty, normalizedEmail, null, null, user.Id), cancellationToken);
            }
            else
            {
                if (!client.LinkToUser(user.Id))
                {
                    return Result<AuthResponse>.Fail("Ya existe un perfil de cliente asociado a otro usuario.");
                }
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

    private async Task SendVerificationEmailAsync(User user, string token, CancellationToken cancellationToken)
    {
        var link = BuildFrontendLink("/verificar-email", token);
        await _emailSender.SendAsync(
            user.Email,
            "Confirma tu cuenta",
            $"""
            <p>Hola {user.FirstName},</p>
            <p>Confirma tu email para poder iniciar sesion y reservar turnos.</p>
            <p><a href="{link}">Confirmar mi cuenta</a></p>
            <p>Este enlace vence en 24 horas.</p>
            """,
            cancellationToken);
    }

    private async Task SendPasswordResetEmailAsync(User user, string token, CancellationToken cancellationToken)
    {
        var link = BuildFrontendLink("/restablecer-contrasena", token);
        await _emailSender.SendAsync(
            user.Email,
            "Restablece tu contrasena",
            $"""
            <p>Hola {user.FirstName},</p>
            <p>Recibimos una solicitud para restablecer tu contrasena.</p>
            <p><a href="{link}">Crear nueva contrasena</a></p>
            <p>Este enlace vence en 1 hora. Si no fuiste vos, podes ignorar este email.</p>
            """,
            cancellationToken);
    }

    private string BuildFrontendLink(string path, string token)
    {
        var baseUrl = string.IsNullOrWhiteSpace(_authLinkOptions.FrontendBaseUrl)
            ? "http://localhost:5173"
            : _authLinkOptions.FrontendBaseUrl.TrimEnd('/');
        return $"{baseUrl}{path}?token={Uri.EscapeDataString(token)}";
    }

    private static string GenerateToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes)
            .Replace("+", "-", StringComparison.Ordinal)
            .Replace("/", "_", StringComparison.Ordinal)
            .TrimEnd('=');
    }

    private static string HashToken(string token)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}
