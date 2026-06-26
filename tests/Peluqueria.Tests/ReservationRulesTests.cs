using FluentAssertions;
using Peluqueria.Domain.Entities;

namespace Peluqueria.Tests;

public sealed class ReservationRulesTests
{
    [Fact]
    public void Should_Reject_Invalid_Time_Range()
    {
        var action = () => new Reservation(Guid.NewGuid(), Guid.NewGuid(), new DateOnly(2026, 6, 21), new TimeOnly(11, 0), new TimeOnly(10, 0), Guid.NewGuid(), null);
        action.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Should_Confirm_Pending_Reservation()
    {
        var reservation = new Reservation(Guid.NewGuid(), Guid.NewGuid(), new DateOnly(2026, 6, 21), new TimeOnly(10, 0), new TimeOnly(11, 0), Guid.NewGuid(), null);
        reservation.Confirm();
        reservation.Status.Should().Be(Peluqueria.Domain.Enums.ReservationStatus.Confirmada);
    }
}