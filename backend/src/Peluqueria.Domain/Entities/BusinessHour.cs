using Peluqueria.Domain.Common;

namespace Peluqueria.Domain.Entities;

public sealed class BusinessHour : BaseEntity
{
    private BusinessHour()
    {
    }

    public BusinessHour(DayOfWeek dayOfWeek, TimeOnly openingTime, TimeOnly closingTime, bool active = true)
    {
        DayOfWeek = dayOfWeek;
        OpeningTime = openingTime;
        ClosingTime = closingTime;
        Active = active;
        Validate();
    }

    public DayOfWeek DayOfWeek { get; private set; }
    public TimeOnly OpeningTime { get; private set; }
    public TimeOnly ClosingTime { get; private set; }
    public bool Active { get; private set; }

    public void Update(TimeOnly openingTime, TimeOnly closingTime, bool active)
    {
        OpeningTime = openingTime;
        ClosingTime = closingTime;
        Active = active;
        Validate();
        Touch();
    }

    private void Validate()
    {
        if (ClosingTime <= OpeningTime)
        {
            throw new InvalidOperationException("La hora de cierre debe ser posterior a la de apertura.");
        }
    }
}