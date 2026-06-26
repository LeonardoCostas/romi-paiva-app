using FluentAssertions;
using Peluqueria.Domain.Entities;
using Peluqueria.Domain.Enums;

namespace Peluqueria.Tests;

public sealed class ServiceRulesTests
{
    [Fact]
    public void Should_Allow_Variable_Price_For_Peluqueria()
    {
        var action = () => new Service("Corte", null, ServiceCategory.Peluqueria, 45, null, true, EyelashServiceKind.None);
        action.Should().NotThrow();
    }

    [Fact]
    public void Should_Reject_Variable_Price_For_Unias()
    {
        var action = () => new Service("Kapping", null, ServiceCategory.Unias, 60, null, true, EyelashServiceKind.None);
        action.Should().Throw<InvalidOperationException>();
    }
}