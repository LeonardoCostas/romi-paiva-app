using Peluqueria.Domain.Common;
using Peluqueria.Domain.Enums;

namespace Peluqueria.Domain.Entities;

public sealed class Service : BaseEntity
{
    private Service()
    {
    }

    public Service(
        string name,
        string? description,
        ServiceCategory category,
        int durationMinutes,
        decimal? price,
        bool priceIsVariable,
        EyelashServiceKind eyelashServiceKind,
        bool active = true)
    {
        Name = name;
        Description = description;
        Category = category;
        DurationMinutes = durationMinutes;
        Price = price;
        PriceIsVariable = priceIsVariable;
        EyelashServiceKind = eyelashServiceKind;
        Active = active;
        ValidatePricingRules();
    }

    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public ServiceCategory Category { get; private set; }
    public int DurationMinutes { get; private set; }
    public decimal? Price { get; private set; }
    public bool PriceIsVariable { get; private set; }
    public EyelashServiceKind EyelashServiceKind { get; private set; }
    public bool Active { get; private set; }

    public void Update(
        string name,
        string? description,
        ServiceCategory category,
        int durationMinutes,
        decimal? price,
        bool priceIsVariable,
        EyelashServiceKind eyelashServiceKind)
    {
        Name = name;
        Description = description;
        Category = category;
        DurationMinutes = durationMinutes;
        Price = price;
        PriceIsVariable = priceIsVariable;
        EyelashServiceKind = eyelashServiceKind;
        ValidatePricingRules();
        Touch();
    }

    public void SetStatus(bool active)
    {
        Active = active;
        Touch();
    }

    private void ValidatePricingRules()
    {
        if (DurationMinutes <= 0)
        {
            throw new InvalidOperationException("La duración del servicio debe ser mayor a cero.");
        }

        if (Category == ServiceCategory.Peluqueria)
        {
            if (!PriceIsVariable && Price is null)
            {
                throw new InvalidOperationException("Los servicios de peluquería deben tener precio variable o un precio definido.");
            }
        }
        else
        {
            if (PriceIsVariable)
            {
                throw new InvalidOperationException("Solo los servicios de peluquería pueden tener precio variable.");
            }

            if (Price is null)
            {
                throw new InvalidOperationException("Los servicios de uñas y pestañas deben tener precio fijo.");
            }
        }

        if (Price is < 0)
        {
            throw new InvalidOperationException("El precio no puede ser negativo.");
        }
    }
}