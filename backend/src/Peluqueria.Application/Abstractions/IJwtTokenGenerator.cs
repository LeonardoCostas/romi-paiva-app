using Peluqueria.Domain.Entities;

namespace Peluqueria.Application.Abstractions;

public interface IJwtTokenGenerator
{
    string Generate(User user);
}