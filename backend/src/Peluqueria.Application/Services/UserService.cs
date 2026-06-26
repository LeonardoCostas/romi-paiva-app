using Peluqueria.Application.Abstractions;
using Peluqueria.Application.Common;
using Peluqueria.Application.Contracts.Users;
using Peluqueria.Domain.Entities;
using Peluqueria.Domain.Repositories;

namespace Peluqueria.Application.Services;

public sealed class UserService
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;

    public UserService(IUserRepository userRepository, IUnitOfWork unitOfWork, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
    }

    public async Task<IReadOnlyList<UserResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetAllAsync(cancellationToken);
        return users.Select(Map).ToList();
    }

    public async Task<Result<UserResponse>> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken)
    {
        var existing = await _userRepository.GetByEmailAsync(request.Email.Trim().ToLowerInvariant(), cancellationToken);
        if (existing is not null)
        {
            return Result<UserResponse>.Fail("Ya existe un usuario con ese email.");
        }

        var user = new User(request.FirstName, request.LastName, request.Email, _passwordHasher.Hash(request.Password), request.Role);
        await _userRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<UserResponse>.Ok(Map(user));
    }

    public async Task<Result<UserResponse>> UpdateAsync(Guid id, UpdateUserRequest request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user is null)
        {
            return Result<UserResponse>.Fail("Usuario no encontrado.");
        }

        user.UpdateProfile(request.FirstName, request.LastName, request.Role);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<UserResponse>.Ok(Map(user));
    }

    public async Task<Result<UserResponse>> UpdateStatusAsync(Guid id, bool active, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user is null)
        {
            return Result<UserResponse>.Fail("Usuario no encontrado.");
        }

        user.SetStatus(active);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<UserResponse>.Ok(Map(user));
    }

    private static UserResponse Map(User user) => new(user.Id, user.FirstName, user.LastName, user.Email, user.Role, user.Active);
}