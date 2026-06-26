using Peluqueria.Application.Common;
using Peluqueria.Application.Contracts.Services;
using Peluqueria.Domain.Entities;
using Peluqueria.Domain.Repositories;

namespace Peluqueria.Application.Services;

public sealed class ServiceCatalogService
{
    private readonly IServiceRepository _serviceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ServiceCatalogService(IServiceRepository serviceRepository, IUnitOfWork unitOfWork)
    {
        _serviceRepository = serviceRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<ServiceResponse>> GetAllAsync(bool? active, CancellationToken cancellationToken)
    {
        var services = await _serviceRepository.GetAllAsync(active, cancellationToken);
        return services.Select(Map).ToList();
    }

    public async Task<Result<ServiceResponse>> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var service = await _serviceRepository.GetByIdAsync(id, cancellationToken);
        return service is null ? Result<ServiceResponse>.Fail("Servicio no encontrado.") : Result<ServiceResponse>.Ok(Map(service));
    }

    public async Task<Result<ServiceResponse>> CreateAsync(CreateServiceRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var service = new Service(request.Name, request.Description, request.Category, request.DurationMinutes, request.Price, request.PriceIsVariable, request.EyelashServiceKind);
            await _serviceRepository.AddAsync(service, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<ServiceResponse>.Ok(Map(service));
        }
        catch (InvalidOperationException exception)
        {
            return Result<ServiceResponse>.Fail(exception.Message);
        }
    }

    public async Task<Result<ServiceResponse>> UpdateAsync(Guid id, UpdateServiceRequest request, CancellationToken cancellationToken)
    {
        var service = await _serviceRepository.GetByIdAsync(id, cancellationToken);
        if (service is null)
        {
            return Result<ServiceResponse>.Fail("Servicio no encontrado.");
        }

        try
        {
            service.Update(request.Name, request.Description, request.Category, request.DurationMinutes, request.Price, request.PriceIsVariable, request.EyelashServiceKind);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<ServiceResponse>.Ok(Map(service));
        }
        catch (InvalidOperationException exception)
        {
            return Result<ServiceResponse>.Fail(exception.Message);
        }
    }

    public async Task<Result<ServiceResponse>> UpdateStatusAsync(Guid id, bool active, CancellationToken cancellationToken)
    {
        var service = await _serviceRepository.GetByIdAsync(id, cancellationToken);
        if (service is null)
        {
            return Result<ServiceResponse>.Fail("Servicio no encontrado.");
        }

        service.SetStatus(active);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<ServiceResponse>.Ok(Map(service));
    }

    private static ServiceResponse Map(Service service) =>
        new(service.Id, service.Name, service.Description, service.Category, service.DurationMinutes, service.Price, service.PriceIsVariable, service.EyelashServiceKind, service.Active);
}