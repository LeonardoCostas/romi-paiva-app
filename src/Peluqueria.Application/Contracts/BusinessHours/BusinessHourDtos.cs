namespace Peluqueria.Application.Contracts.BusinessHours;

public sealed record BusinessHourResponse(Guid Id, DayOfWeek DayOfWeek, TimeOnly OpeningTime, TimeOnly ClosingTime, bool Active);
public sealed record UpdateBusinessHourRequest(DayOfWeek DayOfWeek, TimeOnly OpeningTime, TimeOnly ClosingTime, bool Active);