using Peluqueria.Domain.Enums;

namespace Peluqueria.Application.Contracts.Services;

public sealed record ServiceResponse(
    Guid Id,
    string Name,
    string? Description,
    ServiceCategory Category,
    int DurationMinutes,
    decimal? Price,
    bool PriceIsVariable,
    EyelashServiceKind EyelashServiceKind,
    bool Active);

public sealed record CreateServiceRequest(
    string Name,
    string? Description,
    ServiceCategory Category,
    int DurationMinutes,
    decimal? Price,
    bool PriceIsVariable,
    EyelashServiceKind EyelashServiceKind);

public sealed record UpdateServiceRequest(
    string Name,
    string? Description,
    ServiceCategory Category,
    int DurationMinutes,
    decimal? Price,
    bool PriceIsVariable,
    EyelashServiceKind EyelashServiceKind);

public sealed record UpdateServiceStatusRequest(bool Active);