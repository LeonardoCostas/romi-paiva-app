using Peluqueria.Application.Common;
using Peluqueria.Application.Contracts.BusinessHours;
using Peluqueria.Domain.Entities;
using Peluqueria.Domain.Repositories;

namespace Peluqueria.Application.Services;

public sealed class BusinessHourService
{
    private readonly IBusinessHourRepository _businessHourRepository;
    private readonly IUnitOfWork _unitOfWork;

    public BusinessHourService(IBusinessHourRepository businessHourRepository, IUnitOfWork unitOfWork)
    {
        _businessHourRepository = businessHourRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<BusinessHourResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        var businessHours = await _businessHourRepository.GetAllAsync(cancellationToken);
        return businessHours.OrderBy(x => x.DayOfWeek).Select(Map).ToList();
    }

    public async Task<Result<IReadOnlyList<BusinessHourResponse>>> UpdateAsync(IEnumerable<UpdateBusinessHourRequest> requests, CancellationToken cancellationToken)
    {
        var existing = await _businessHourRepository.GetAllAsync(cancellationToken);
        var existingByDay = existing.ToDictionary(x => x.DayOfWeek);

        foreach (var request in requests)
        {
            if (existingByDay.TryGetValue(request.DayOfWeek, out var businessHour))
            {
                businessHour.Update(request.OpeningTime, request.ClosingTime, request.Active);
            }
            else
            {
                existingByDay[request.DayOfWeek] = new BusinessHour(request.DayOfWeek, request.OpeningTime, request.ClosingTime, request.Active);
            }
        }

        var newItems = existingByDay.Values.Where(x => existing.All(e => e.Id != x.Id)).ToList();
        if (newItems.Count > 0)
        {
            await _businessHourRepository.AddRangeAsync(newItems, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<IReadOnlyList<BusinessHourResponse>>.Ok(existingByDay.Values.OrderBy(x => x.DayOfWeek).Select(Map).ToList());
    }

    private static BusinessHourResponse Map(BusinessHour businessHour) =>
        new(businessHour.Id, businessHour.DayOfWeek, businessHour.OpeningTime, businessHour.ClosingTime, businessHour.Active);
}