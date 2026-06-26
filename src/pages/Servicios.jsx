import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Loader2, Sparkles, Tag } from 'lucide-react';
import { fetchServices } from '../services/bookingApi';
import { formatDuration, formatPrice, getCategoryLabel } from '../utils/booking';

const CATEGORY_ORDER = ['Pestanias', 'Peluqueria', 'Unias', 3, 1, 2];

const EYELASH_KIND_LABELS = {
  0: null,
  1: 'Set completo',
  2: 'Service / mantenimiento',
  3: 'Remoción',
  4: 'Remoción + set completo',
  None: null,
  SetCompleto: 'Set completo',
  Service: 'Service / mantenimiento',
  Remocion: 'Remoción',
  RemocionYSetCompleto: 'Remoción + set completo',
};

function getEyelashKindLabel(kind) {
  return EYELASH_KIND_LABELS[kind] ?? null;
}

function groupByCategory(services) {
  const groups = new Map();

  services.forEach((service) => {
    const key = String(service.category);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(service);
  });

  return [...groups.entries()].sort(([a], [b]) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

export default function Servicios() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchServices(true);
        if (!cancelled) {
          setServices(response);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError('No pudimos cargar los servicios. Intentá de nuevo en unos minutos.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadServices();
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = useMemo(() => groupByCategory(services), [services]);

  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: "'Inter', sans-serif",
        background: 'linear-gradient(180deg, #100608 0%, #0a0406 100%)',
        color: '#f5edf0',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@300;400;500;600&display=swap');

        .svc-card {
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 20px;
          padding: 24px;
          transition: border-color .25s, transform .25s, box-shadow .25s;
        }
        .svc-card:hover {
          border-color: rgba(221,160,187,.35);
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0,0,0,.35);
        }

        .svc-reservar-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #dda0bb 0%, #b8638e 100%);
          color: #fff; border: none; border-radius: 100px;
          padding: 12px 24px; font-size: 12px; font-weight: 600;
          letter-spacing: .07em; text-transform: uppercase;
          text-decoration: none; transition: opacity .2s, transform .2s;
          box-shadow: 0 4px 20px rgba(180,90,140,.3);
        }
        .svc-reservar-btn:hover { opacity: .92; transform: translateY(-1px); }

        @media (max-width: 768px) {
          .svc-grid { grid-template-columns: 1fr !important; }
          .svc-header { padding: 24px 20px 0 !important; }
          .svc-content { padding: 24px 20px 48px !important; }
        }
      `}</style>

      <header
        className="svc-header"
        style={{
          padding: '32px 52px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: '#dda0bb',
            textDecoration: 'none',
            fontSize: 13,
            letterSpacing: '.04em',
          }}
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>

        <Link to="/reservar" className="svc-reservar-btn">
          <Sparkles size={14} />
          Reservar turno
        </Link>
      </header>

      <main className="svc-content" style={{ padding: '40px 52px 64px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: '.22em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,.35)',
              margin: '0 0 10px',
            }}
          >
            Estética Romi Paiva
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 52px)',
              fontWeight: 700,
              margin: '0 0 12px',
              lineHeight: 1.1,
            }}
          >
            Servicios y precios
          </h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,.5)', fontSize: 15, maxWidth: 560, lineHeight: 1.7 }}>
            Todos nuestros tratamientos premium con duración estimada y valores actualizados.
          </p>
        </div>

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,.55)', padding: '48px 0' }}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            Cargando servicios...
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '20px 24px',
              borderRadius: 14,
              border: '1px solid rgba(232,93,93,.35)',
              background: 'rgba(232,93,93,.08)',
              color: '#f5c4c4',
              marginBottom: 32,
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && services.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,.45)', padding: '32px 0' }}>
            No hay servicios activos disponibles por el momento.
          </p>
        )}

        {grouped.map(([categoryKey, items]) => (
          <section key={categoryKey} style={{ marginBottom: 48 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
                paddingBottom: 12,
                borderBottom: '1px solid rgba(255,255,255,.08)',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#e8a4c0',
                  boxShadow: '0 0 10px rgba(232,164,192,.5)',
                }}
              />
              <h2
                style={{
                  margin: 0,
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 24,
                  fontWeight: 600,
                }}
              >
                {getCategoryLabel(items[0].category)}
              </h2>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>
                {items.length} {items.length === 1 ? 'servicio' : 'servicios'}
              </span>
            </div>

            <div
              className="svc-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 20,
              }}
            >
              {items.map((service) => {
                const eyelashLabel = getEyelashKindLabel(service.eyelashServiceKind);

                return (
                  <article key={service.id} className="svc-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, lineHeight: 1.35, color: '#fff' }}>
                        {service.name}
                      </h3>
                      <span
                        style={{
                          flexShrink: 0,
                          fontSize: 10,
                          letterSpacing: '.12em',
                          textTransform: 'uppercase',
                          padding: '4px 10px',
                          borderRadius: 100,
                          background: 'rgba(221,160,187,.12)',
                          color: '#e8a4c0',
                          border: '1px solid rgba(221,160,187,.2)',
                        }}
                      >
                        {getCategoryLabel(service.category)}
                      </span>
                    </div>

                    {service.description && (
                      <p style={{ margin: '0 0 16px', fontSize: 14, lineHeight: 1.65, color: 'rgba(255,255,255,.52)' }}>
                        {service.description}
                      </p>
                    )}

                    {!service.description && (
                      <p style={{ margin: '0 0 16px', fontSize: 13, color: 'rgba(255,255,255,.28)', fontStyle: 'italic' }}>
                        Sin descripción adicional.
                      </p>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                        <Tag size={15} color="#c8a060" />
                        <span style={{ color: 'rgba(255,255,255,.45)', minWidth: 72 }}>Precio</span>
                        <strong style={{ color: service.priceIsVariable ? '#e8a4c0' : '#f5edf0' }}>
                          {formatPrice(service)}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                        <Clock size={15} color="#c8a060" />
                        <span style={{ color: 'rgba(255,255,255,.45)', minWidth: 72 }}>Duración</span>
                        <strong>{formatDuration(service.durationMinutes)}</strong>
                      </div>

                      {eyelashLabel && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                          <Sparkles size={14} color="#c8a060" />
                          <span style={{ color: 'rgba(255,255,255,.45)', minWidth: 72 }}>Tipo</span>
                          <span>{eyelashLabel}</span>
                        </div>
                      )}

                      {service.priceIsVariable && (
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 11,
                            color: 'rgba(255,255,255,.38)',
                            padding: '8px 12px',
                            borderRadius: 10,
                            background: 'rgba(255,255,255,.03)',
                            border: '1px solid rgba(255,255,255,.06)',
                          }}
                        >
                          El valor final se confirma según el trabajo y la evaluación en el salón.
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/reservar?serviceId=${service.id}`}
                      className="svc-reservar-btn"
                      style={{ marginTop: 18, width: '100%', justifyContent: 'center', fontSize: 11 }}
                    >
                      Reservar este servicio
                    </Link>
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        {!loading && !error && services.length > 0 && (
          <div
            style={{
              marginTop: 16,
              padding: '28px 32px',
              borderRadius: 20,
              border: '1px solid rgba(221,160,187,.2)',
              background: 'rgba(221,160,187,.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 6 }}>
                ¿Lista para tu turno?
              </div>
              <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,.5)' }}>
                Elegí el servicio y reservá el horario que más te convenga.
              </p>
            </div>
            <Link to="/reservar" className="svc-reservar-btn">
              Reservar ahora
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
