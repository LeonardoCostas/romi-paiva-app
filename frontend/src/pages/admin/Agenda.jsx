import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  DollarSign,
  Filter,
  Globe2,
  LayoutDashboard,
  Loader2,
  LogOut,
  Plus,
  Scissors,
  Settings,
  User,
  Users,
} from 'lucide-react';
import { fetchClients, fetchReservations, fetchServices } from '../../services/bookingApi';
import { clearSession } from '../../utils/auth';
import { formatDateLabel, formatTimeLabel, getStatusColor, getStatusLabel, normalizeStatus } from '../../utils/booking';
import { AdminMobileNav } from './AdminSection';

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const SLOT_HEIGHT = 56;
const START_HOUR = 9;

const NAV_PRINCIPAL = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/admin/turnos', label: 'Turnos', icon: ClipboardList },
];

const NAV_GESTION = [
  { to: '/admin/clientes', label: 'Clientes', icon: Users },
  { to: '/admin/servicios', label: 'Servicios', icon: Scissors },
  { to: '/admin/profesionales', label: 'Profesionales', icon: User },
  { to: '/admin/horarios', label: 'Horarios', icon: Clock },
];

const NAV_REPORTES = [
  { to: '/admin/finanzas', label: 'Finanzas', icon: DollarSign },
  { to: '/admin/configuracion', label: 'Configuración', icon: Settings },
];

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateOnly(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseTime(time) {
  const [h, m] = time.split(':').map(Number);
  return h + (m || 0) / 60;
}

function getEventStyle(start, end) {
  const top = (parseTime(start) - START_HOUR) * SLOT_HEIGHT;
  const height = (parseTime(end) - parseTime(start)) * SLOT_HEIGHT;
  return { top: Math.max(top, 0), height: Math.max(height, 32) };
}

function formatDayHeader(date) {
  const days = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  return `${days[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`;
}

function formatRange(start, end) {
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()} – ${end.getDate()} ${months[start.getMonth()]} ${start.getFullYear()}`;
  }
  return `${start.getDate()} ${months[start.getMonth()]} – ${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`;
}

function SidebarLink({ to, label, icon: Icon, pathname }) {
  const active = pathname === to || (to !== '/admin/dashboard' && pathname.startsWith(to));
  return (
    <Link
      to={to}
      className="agenda-sidebar-link"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        borderRadius: 10,
        textDecoration: 'none',
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        color: active ? '#fff' : 'rgba(255,255,255,.55)',
        background: active ? 'rgba(255,255,255,.1)' : 'transparent',
        transition: 'background .2s, color .2s',
      }}
    >
      <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
      <span className="agenda-sidebar-label">{label}</span>
    </Link>
  );
}

export default function Agenda() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [view, setView] = useState('semana');
  const [reservations, setReservations] = useState([]);
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('todos');

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const servicesMap = useMemo(() => new Map(services.map((service) => [service.id, service])), [services]);
  const clientsMap = useMemo(() => new Map(clients.map((client) => [client.id, client])), [clients]);
  const weekDateSet = useMemo(() => new Set(weekDays.map(toDateOnly)), [weekDays]);
  const weekReservations = useMemo(
    () => reservations.filter((reservation) => {
      const inWeek = weekDateSet.has(reservation.date);
      if (!inWeek) return false;
      if (statusFilter === 'todos') return true;
      return normalizeStatus(reservation.status) === statusFilter;
    }),
    [reservations, weekDateSet, statusFilter],
  );
  const mobileWeekReservations = useMemo(
    () => [...weekReservations].sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)),
    [weekReservations],
  );

  const rangeLabel = formatRange(weekDays[0], weekDays[6]);

  useEffect(() => {
    let cancelled = false;

    async function loadAgenda() {
      setLoading(true);
      setError(null);

      try {
        const [reservationData, serviceData, clientData] = await Promise.all([
          fetchReservations(),
          fetchServices(true),
          fetchClients({ active: true }),
        ]);

        if (!cancelled) {
          setReservations(reservationData);
          setServices(serviceData);
          setClients(clientData);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError('No pudimos cargar la agenda. Verificá que la API esté activa y que tu usuario sea admin.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAgenda();

    return () => {
      cancelled = true;
    };
  }, []);

  const goToday = () => setWeekStart(startOfWeek(new Date()));
  const goPrev = () => setWeekStart((prev) => addDays(prev, -7));
  const goNext = () => setWeekStart((prev) => addDays(prev, 7));

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  return (
    <div
      className="agenda-root"
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: "'Inter', sans-serif",
        background: '#f4f2f5',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        html, body, #root { max-width: 100%; overflow-x: hidden; }
        .agenda-root { width: 100%; max-width: 100vw; overflow-x: hidden; }
        .agenda-root * { box-sizing: border-box; }
        .agenda-sidebar-link:hover { background: rgba(255,255,255,.06) !important; color: rgba(255,255,255,.85) !important; }
        .agenda-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #dda0bb 0%, #b8638e 100%);
          color: #fff; border: none; border-radius: 10px;
          padding: 10px 18px; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: opacity .2s, transform .2s;
          box-shadow: 0 4px 16px rgba(180,90,140,.28);
        }
        .agenda-btn-primary:hover { opacity: .92; transform: translateY(-1px); }
        .agenda-btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; color: #555; border: 1px solid #e5e0ea;
          border-radius: 10px; padding: 10px 16px; font-size: 13px;
          font-weight: 500; cursor: pointer; transition: border-color .2s, background .2s;
        }
        .agenda-nav-btn {
          width: 34px; height: 34px; border-radius: 8px;
          border: 1px solid #e5e0ea; background: #fff; color: #666;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: border-color .2s, background .2s;
        }
        .agenda-nav-btn:hover, .agenda-btn-ghost:hover { border-color: #cda0bc; background: #faf8fb; }
        .agenda-view-btn {
          padding: 8px 16px; border: none; background: transparent;
          font-size: 12px; font-weight: 500; color: #888; cursor: pointer;
          border-radius: 8px; transition: background .2s, color .2s;
        }
        .agenda-view-btn.active { background: linear-gradient(135deg, #dda0bb 0%, #b8638e 100%); color: #fff; }
        .agenda-event {
          position: absolute; left: 4px; right: 4px;
          border-radius: 8px; padding: 6px 8px;
          font-size: 11px; line-height: 1.35; overflow: hidden;
          cursor: pointer; border-left: 3px solid;
          transition: transform .15s, box-shadow .15s;
        }
        .agenda-event:hover { transform: scale(1.02); box-shadow: 0 4px 12px rgba(0,0,0,.12); z-index: 2; }
        .agenda-mobile-list { display: none; }
        @media (max-width: 1100px) {
          .agenda-sidebar { width: 72px !important; padding: 20px 10px !important; }
          .agenda-sidebar-label, .agenda-sidebar-section, .agenda-sidebar-user-text { display: none !important; }
          .agenda-main { margin-left: 72px !important; }
        }
        @media (max-width: 720px) {
          .agenda-sidebar { display: none !important; }
          .agenda-root { padding-top: 60px; }
          .agenda-main { margin-left: 0 !important; }
          .agenda-header { padding: 16px 14px !important; align-items: stretch !important; }
          .agenda-header-title { display: none !important; }
          .agenda-header-actions { width: 100%; justify-content: stretch; }
          .agenda-header-actions > button { flex: 1 1 0; min-width: 0; justify-content: center; min-height: 42px; }
          .agenda-content { padding: 14px !important; }
          .agenda-calendar-toolbar { padding: 14px !important; }
          .agenda-calendar-title { width: 100%; text-align: center; font-size: 17px !important; }
          .agenda-calendar-switch { width: 100%; justify-content: center; }
          .agenda-calendar-scroll { display: none; }
          .agenda-mobile-list { display: grid; gap: 10px; padding: 14px; }
          .agenda-mobile-card { border: 1px solid #f0ecf2; border-radius: 12px; padding: 12px; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,.03); }
        }
      `}</style>

      <AdminMobileNav title="Agenda" onLogout={handleLogout} />

      <aside
        className="agenda-sidebar"
        style={{
          width: 240,
          flexShrink: 0,
          background: 'linear-gradient(180deg, #1a1218 0%, #100608 100%)',
          borderRight: '1px solid rgba(255,255,255,.06)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
          position: 'fixed',
          inset: '0 auto 0 0',
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 28px' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(221,160,187,.15)',
              border: '1px solid rgba(221,160,187,.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={18} color="#dda0bb" />
          </div>
          <div className="agenda-sidebar-label">
            <div style={{ fontSize: 9, letterSpacing: '.22em', color: 'rgba(255,255,255,.35)', textTransform: 'uppercase' }}>
              Panel admin
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f5edf0', marginTop: 2 }}>Estética Romi Paiva</div>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div className="agenda-sidebar-section" style={{ fontSize: 9, letterSpacing: '.18em', color: 'rgba(255,255,255,.28)', textTransform: 'uppercase', padding: '0 14px 8px' }}>
            Principal
          </div>
          {NAV_PRINCIPAL.map(({ to, label, icon }) => (
            <SidebarLink key={to} to={to} label={label} icon={icon} pathname={pathname} />
          ))}

          <div className="agenda-sidebar-section" style={{ fontSize: 9, letterSpacing: '.18em', color: 'rgba(255,255,255,.28)', textTransform: 'uppercase', padding: '20px 14px 8px' }}>
            Gestión
          </div>
          {NAV_GESTION.map(({ to, label, icon }) => (
            <SidebarLink key={to} to={to} label={label} icon={icon} pathname={pathname} />
          ))}

          <div className="agenda-sidebar-section" style={{ fontSize: 9, letterSpacing: '.18em', color: 'rgba(255,255,255,.28)', textTransform: 'uppercase', padding: '20px 14px 8px' }}>
            Reportes
          </div>
          {NAV_REPORTES.map(({ to, label, icon }) => (
            <SidebarLink key={to} to={to} label={label} icon={icon} pathname={pathname} />
          ))}
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 16 }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              marginBottom: 8,
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,.08)',
              background: 'rgba(255,255,255,.07)',
              color: 'rgba(255,255,255,.78)',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Globe2 size={16} />
            <span className="agenda-sidebar-label">Ver sitio web</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '10px 14px',
              borderRadius: 10,
              border: 'none',
              background: 'rgba(255,255,255,.05)',
              color: 'rgba(255,255,255,.6)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <LogOut size={16} />
            <span className="agenda-sidebar-label">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main className="agenda-main" style={{ flex: 1, marginLeft: 240, minWidth: 0 }}>
        <header
          className="agenda-header"
          style={{
            background: '#fff',
            borderBottom: '1px solid #ece8ef',
            padding: '22px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div className="agenda-header-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Calendar size={22} color="#b8638e" />
              <h1 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#1a1218' }}>
                Agenda
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#888' }}>
              Vista de calendario · {weekReservations.length} {weekReservations.length === 1 ? 'turno' : 'turnos'} esta semana
            </p>
          </div>

          <div className="agenda-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button type="button" className="agenda-btn-ghost" onClick={() => setShowFilters((value) => !value)}>
              <Filter size={15} />
              Filtros
            </button>
            <button type="button" className="agenda-btn-primary" onClick={() => navigate('/admin/turnos')}>
              <Plus size={16} />
              Nuevo turno
            </button>
          </div>
        </header>

        <div className="agenda-content" style={{ padding: '24px 32px 32px' }}>
          {showFilters && (
            <div style={{ marginBottom: 18, padding: 16, borderRadius: 14, background: '#fff', border: '1px solid #ece8ef', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <label style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>Estado</label>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={{ border: '1px solid #e5e0ea', borderRadius: 10, padding: '9px 12px', fontSize: 13, minWidth: 180 }}>
                <option value="todos">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Confirmada">Confirmado</option>
                <option value="Completada">Realizado</option>
                <option value="Cancelada">Cancelado</option>
                <option value="Ausente">Ausente</option>
              </select>
            </div>
          )}

          {error && (
            <div style={{ marginBottom: 18, padding: '14px 18px', borderRadius: 12, background: '#fff2f2', border: '1px solid #f3c4c4', color: '#9a3b3b', fontSize: 14 }}>
              {error}
            </div>
          )}

          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ece8ef', boxShadow: '0 2px 12px rgba(0,0,0,.04)', overflow: 'hidden' }}>
            <div className="agenda-calendar-toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0ecf2', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button type="button" className="agenda-nav-btn" onClick={goPrev} aria-label="Semana anterior">
                  <ChevronLeft size={18} />
                </button>
                <button type="button" className="agenda-nav-btn" onClick={goNext} aria-label="Semana siguiente">
                  <ChevronRight size={18} />
                </button>
                <button type="button" onClick={goToday} style={{ marginLeft: 4, padding: '8px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #dda0bb 0%, #b8638e 100%)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Hoy
                </button>
              </div>

              <div className="agenda-calendar-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: '#1a1218' }}>
                {rangeLabel}
              </div>

              <div className="agenda-calendar-switch" style={{ display: 'flex', background: '#f4f2f5', borderRadius: 10, padding: 3 }}>
                {['mes', 'semana', 'dia'].map((v) => (
                  <button key={v} type="button" className={`agenda-view-btn${view === v ? ' active' : ''}`} onClick={() => setView(v)}>
                    {v === 'mes' ? 'Mes' : v === 'semana' ? 'Semana' : 'Día'}
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <div style={{ padding: '48px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, color: '#777', fontSize: 14 }}>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Cargando agenda...
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {!loading && view === 'semana' && (
              <div className="agenda-mobile-list">
                {mobileWeekReservations.map((reservation) => {
                  const status = normalizeStatus(reservation.status);
                  const statusColor = getStatusColor(status);
                  const service = servicesMap.get(reservation.serviceId);
                  const client = clientsMap.get(reservation.clientId);
                  const clientName = client ? `${client.firstName} ${client.lastName}` : 'Cliente';

                  return (
                    <article key={reservation.id} className="agenda-mobile-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ display: 'block', color: '#1a1218', fontSize: 14 }}>{service?.name ?? 'Servicio'}</strong>
                          <span style={{ display: 'block', marginTop: 4, color: '#777', fontSize: 12 }}>{clientName}</span>
                        </div>
                        <span style={{ flexShrink: 0, borderRadius: 999, padding: '4px 8px', background: `${statusColor}18`, color: statusColor, fontSize: 11, fontWeight: 700 }}>
                          {getStatusLabel(status)}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gap: 4, marginTop: 10, color: '#666', fontSize: 12 }}>
                        <span>{formatDateLabel(reservation.date)}</span>
                        <span>{formatTimeLabel(reservation.startTime)} - {formatTimeLabel(reservation.endTime)}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {!loading && view === 'semana' && (
              <div className="agenda-calendar-scroll" style={{ overflowX: 'auto' }}>
                <div style={{ minWidth: 780, display: 'flex' }}>
                  <div style={{ width: 56, flexShrink: 0, borderRight: '1px solid #f0ecf2' }}>
                    <div style={{ height: 44, borderBottom: '1px solid #f0ecf2' }} />
                    {HOURS.map((hour) => (
                      <div key={hour} style={{ height: SLOT_HEIGHT, padding: '4px 8px 0 0', textAlign: 'right', fontSize: 11, color: '#aaa', borderBottom: '1px solid #f8f6fa' }}>
                        {`${hour}:00`}
                      </div>
                    ))}
                  </div>

                  {weekDays.map((day, dayIndex) => {
                    const dayKey = toDateOnly(day);
                    const dayReservations = weekReservations.filter((reservation) => reservation.date === dayKey);
                    const isToday = day.toDateString() === new Date().toDateString();

                    return (
                      <div key={day.toISOString()} style={{ flex: 1, minWidth: 100, borderRight: dayIndex < 6 ? '1px solid #f0ecf2' : 'none', background: isToday ? 'rgba(221,160,187,.04)' : 'transparent' }}>
                        <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0ecf2', fontSize: 12, fontWeight: isToday ? 700 : 500, color: isToday ? '#b8638e' : '#666' }}>
                          {formatDayHeader(day)}
                        </div>

                        <div style={{ position: 'relative', height: HOURS.length * SLOT_HEIGHT }}>
                          {HOURS.map((hour) => (
                            <div key={hour} style={{ height: SLOT_HEIGHT, borderBottom: '1px solid #f8f6fa' }} />
                          ))}

                          {dayReservations.map((reservation) => {
                            const status = normalizeStatus(reservation.status);
                            const statusColor = getStatusColor(status);
                            const service = servicesMap.get(reservation.serviceId);
                            const client = clientsMap.get(reservation.clientId);
                            const { top, height } = getEventStyle(reservation.startTime, reservation.endTime);
                            const clientName = client ? `${client.firstName} ${client.lastName}` : 'Cliente';

                            return (
                              <div key={reservation.id} className="agenda-event" style={{ top, height, background: `${statusColor}18`, borderLeftColor: statusColor, color: '#333' }} title={`${service?.name ?? 'Servicio'} · ${getStatusLabel(status)}`}>
                                <div style={{ fontWeight: 700, color: statusColor, fontSize: 10 }}>
                                  {formatTimeLabel(reservation.startTime)} – {formatTimeLabel(reservation.endTime)}
                                </div>
                                <div style={{ fontWeight: 600, marginTop: 2 }}>{service?.name ?? 'Servicio'}</div>
                                <div style={{ color: '#888', fontSize: 10 }}>{clientName}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!loading && view === 'semana' && weekReservations.length === 0 && (
              <div style={{ padding: '18px 24px', borderTop: '1px solid #f0ecf2', background: '#faf9fb', color: '#888', fontSize: 14, textAlign: 'center' }}>
                No hay turnos cargados para esta semana.
              </div>
            )}

            {!loading && view !== 'semana' && (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: '#999', fontSize: 14 }}>
                Vista de {view === 'mes' ? 'mes' : 'día'} próximamente.
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, padding: '14px 20px', borderTop: '1px solid #f0ecf2', background: '#faf9fb' }}>
              {['Pendiente', 'Confirmada', 'Completada', 'Cancelada', 'Ausente'].map((status) => (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#666' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: getStatusColor(status), flexShrink: 0 }} />
                  {getStatusLabel(status)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
