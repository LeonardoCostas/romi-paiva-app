import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Loader2, Sparkles, XCircle } from 'lucide-react';
import { formatDateLabel, formatDuration, formatTimeLabel, getStatusColor, getStatusLabel } from "../../utils/booking";
import { cancelReservation, fetchMyReservations, fetchServices } from '../../services/bookingApi';

export default function MisTurnos() {
  const [reservations, setReservations] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const servicesMap = useMemo(
    () => new Map(services.map((service) => [service.id, service])),
    [services],
  );

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [reservationsData, servicesData] = await Promise.all([
        fetchMyReservations(),
        fetchServices(true),
      ]);
      setReservations(
        [...reservationsData].sort((a, b) => {
          if (a.date === b.date) return a.startTime.localeCompare(b.startTime);
          return b.date.localeCompare(a.date);
        }),
      );
      setServices(servicesData);
    } catch (err) {
      console.error(err);
      setError('No pudimos cargar tus turnos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('¿Querés cancelar este turno?')) return;

    setCancellingId(id);
    setError(null);

    try {
      await cancelReservation(id);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error ?? 'No se pudo cancelar el turno.');
    } finally {
      setCancellingId(null);
    }
  };

  const canCancel = (status) => {
    const value = String(status);
    return value === 'Pendiente' || value === 'Confirmada' || value === '1' || value === '2';
  };

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#f5edf0', padding: '32px 24px 64px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        .mt-card {
          background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08);
          border-radius: 18px; padding: 22px;
        }
        .mt-btn {
          background: rgba(232,93,93,.12); border: 1px solid rgba(232,93,93,.25);
          color: #f5c4c4; border-radius: 10px; padding: 10px 14px; cursor: pointer; font-size: 13px;
        }
        .mt-btn:disabled { opacity: .5; cursor: not-allowed; }
        .mt-btn-reserve {
          display: inline-flex; align-items: center; gap: 8px; text-decoration: none;
          background: linear-gradient(135deg, #dda0bb 0%, #b8638e 100%);
          color: #fff; border-radius: 100px; padding: 12px 22px; font-size: 13px; font-weight: 600;
        }
      `}</style>

      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, margin: '0 0 8px' }}>Mis turnos</h1>
        <p style={{ color: 'rgba(255,255,255,.5)', margin: '0 0 28px' }}>
          Acá podés ver y cancelar tus reservas activas.
        </p>

        {error && (
          <div style={{ marginBottom: 20, padding: '14px 18px', borderRadius: 12, background: 'rgba(232,93,93,.1)', border: '1px solid rgba(232,93,93,.25)', color: '#f5c4c4' }}>
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-card" style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,.6)' }}>
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            Cargando turnos...
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!loading && reservations.length === 0 && (
          <div className="mt-card" style={{ textAlign: 'center' }}>
            <Sparkles size={36} color="#dda0bb" style={{ marginBottom: 12 }} />
            <h2 style={{ margin: '0 0 8px', fontSize: 22 }}>Todavía no tenés turnos</h2>
            <p style={{ color: 'rgba(255,255,255,.45)', marginBottom: 20 }}>
              Explorá nuestros servicios y reservá tu próxima cita.
            </p>
            <Link to="/reservar" className="mt-btn-reserve">Reservar turno</Link>
          </div>
        )}

        {!loading && reservations.length > 0 && (
          <div style={{ display: 'grid', gap: 16 }}>
            {reservations.map((reservation) => {
              const service = servicesMap.get(reservation.serviceId);
              const statusLabel = getStatusLabel(reservation.status);
              const statusColor = getStatusColor(reservation.status);

              return (
                <article key={reservation.id} className="mt-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <span
                          style={{
                            fontSize: 11,
                            letterSpacing: '.08em',
                            textTransform: 'uppercase',
                            padding: '4px 10px',
                            borderRadius: 100,
                            color: statusColor,
                            border: `1px solid ${statusColor}55`,
                            background: `${statusColor}18`,
                          }}
                        >
                          {statusLabel}
                        </span>
                      </div>

                      <h3 style={{ margin: '0 0 10px', fontSize: 20 }}>
                        {service?.name ?? 'Servicio'}
                      </h3>

                      <div style={{ display: 'grid', gap: 8, color: 'rgba(255,255,255,.55)', fontSize: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Calendar size={15} color="#dda0bb" />
                          {formatDateLabel(reservation.date)}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Clock size={15} color="#dda0bb" />
                          {formatTimeLabel(reservation.startTime)} – {formatTimeLabel(reservation.endTime)}
                          {service ? ` · ${formatDuration(service.durationMinutes)}` : ''}
                        </div>
                      </div>

                      {reservation.notes && (
                        <p style={{ margin: '12px 0 0', fontSize: 13, color: 'rgba(255,255,255,.4)' }}>
                          Nota: {reservation.notes}
                        </p>
                      )}
                    </div>

                    {canCancel(reservation.status) && (
                      <button
                        type="button"
                        className="mt-btn"
                        disabled={cancellingId === reservation.id}
                        onClick={() => handleCancel(reservation.id)}
                      >
                        <XCircle size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                        {cancellingId === reservation.id ? 'Cancelando...' : 'Cancelar turno'}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
