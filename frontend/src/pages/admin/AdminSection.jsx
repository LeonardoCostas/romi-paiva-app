import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  ClipboardList,
  Clock,
  DollarSign,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Pencil,
  Save,
  Scissors,
  Settings,
  User,
  Users,
  X,
} from 'lucide-react';
import {
  fetchBusinessHours,
  fetchClients,
  fetchReservations,
  fetchServices,
  fetchUsers,
  updateBusinessHours,
  updateService,
  updateServiceStatus,
} from '../../services/bookingApi';
import { clearSession } from '../../utils/auth';
import { formatDuration, formatPrice, getCategoryLabel, isCanceledStatus, isCompletedStatus } from '../../utils/booking';

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

const SECTION_META = {
  clientes: { title: 'Clientes', icon: Users },
  servicios: { title: 'Servicios', icon: Scissors },
  profesionales: { title: 'Profesionales', icon: User },
  horarios: { title: 'Horarios', icon: Clock },
  finanzas: { title: 'Finanzas', icon: DollarSign },
  configuracion: { title: 'Configuración', icon: Settings },
};

const DAY_LABELS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function toTimeInput(value) {
  return String(value ?? '').slice(0, 5);
}

function SidebarLink({ to, label, icon: Icon, pathname }) {
  const active = pathname === to || (to !== '/admin/dashboard' && pathname.startsWith(to));
  return (
    <Link to={to} className="admin-sidebar-link" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#fff' : 'rgba(255,255,255,.55)', background: active ? 'rgba(255,255,255,.1)' : 'transparent' }}>
      <Icon size={16} />
      <span className="admin-sidebar-label">{label}</span>
    </Link>
  );
}

export function AdminMobileNav({ title, onLogout }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const items = [...NAV_PRINCIPAL, ...NAV_GESTION, ...NAV_REPORTES];

  const logout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    clearSession();
    navigate('/');
  };

  return (
    <>
      <style>{`
        .admin-mobile-bar { display: none; }
        @media (max-width: 720px) {
          .admin-mobile-bar { display: flex; position: fixed; top: 0; left: 0; right: 0; z-index: 1000; width: 100vw; min-height: 60px; align-items: center; justify-content: space-between; padding: 10px 14px; background: #1a1218; color: #fff; box-shadow: 0 3px 14px rgba(0,0,0,.18); }
          .admin-mobile-menu { position: fixed; top: 60px; left: 0; right: 0; bottom: 0; z-index: 999; width: 100vw; max-width: 100vw; overflow-x: hidden; overflow-y: auto; padding: 16px; background: #100608; }
          .admin-mobile-menu-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
        }
      `}</style>
      <div className="admin-mobile-bar">
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 9, letterSpacing: '.18em', color: 'rgba(255,255,255,.45)', textTransform: 'uppercase' }}>Romi Paiva</div>
          <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 16 }}>{title}</strong>
        </div>
        <button type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Cerrar menú' : 'Abrir menú'} style={{ width: 40, height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,.16)', borderRadius: 10, background: 'rgba(255,255,255,.06)', color: '#fff' }}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <nav className="admin-mobile-menu" aria-label="Navegación del panel">
          <div className="admin-mobile-menu-grid">
            {items.map(({ to, label, icon: Icon }) => {
              const active = pathname === to || (to !== '/admin/dashboard' && pathname.startsWith(to));
              return (
                <Link key={to} to={to} onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 9, minHeight: 48, padding: '10px 12px', borderRadius: 10, color: active ? '#fff' : 'rgba(255,255,255,.7)', background: active ? 'rgba(221,160,187,.24)' : 'rgba(255,255,255,.05)', textDecoration: 'none', fontSize: 13, fontWeight: active ? 600 : 400 }}>
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </div>
          <button type="button" onClick={logout} style={{ width: '100%', marginTop: 18, minHeight: 46, border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, background: 'rgba(255,255,255,.06)', color: '#fff', fontSize: 13 }}>
            Cerrar sesión
          </button>
        </nav>
      )}
    </>
  );
}

export function AdminLayout({ title, icon: Icon = LayoutDashboard, children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  return (
    <div className="admin-shell" style={{ minHeight: '100vh', display: 'flex', background: '#f4f2f5', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        html, body, #root { max-width: 100%; overflow-x: hidden; }
        .admin-shell { width: 100%; max-width: 100vw; overflow-x: hidden; }
        .admin-sidebar-link:hover { background: rgba(255,255,255,.06) !important; color: rgba(255,255,255,.85) !important; }
        .admin-btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: none; border-radius: 10px; padding: 10px 16px; background: linear-gradient(135deg, #dda0bb 0%, #b8638e 100%); color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; }
        .admin-btn-ghost { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid #e5e0ea; border-radius: 10px; padding: 9px 14px; background: #fff; color: #555; font-size: 13px; cursor: pointer; text-decoration: none; }
        .admin-btn-danger { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid #f1b8b8; border-radius: 10px; padding: 9px 14px; background: #fff5f5; color: #a64444; font-size: 13px; cursor: pointer; }
        .admin-table-wrap { width: 100%; overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .admin-table th { text-align: left; color: #777; font-weight: 600; background: #faf9fb; border-bottom: 1px solid #eee8f0; padding: 12px 14px; }
        .admin-table td { border-bottom: 1px solid #f0ecf2; padding: 13px 14px; color: #333; vertical-align: top; }
        .admin-card { background: #fff; border: 1px solid #ece8ef; border-radius: 14px; box-shadow: 0 2px 12px rgba(0,0,0,.04); overflow: hidden; }
        .admin-input { width: 100%; border: 1px solid #e5e0ea; border-radius: 10px; padding: 10px 12px; font-size: 13px; outline: none; }
        .admin-input:focus { border-color: #cda0bc; }
        @media (max-width: 1100px) { .admin-sidebar { width: 72px !important; padding: 20px 10px !important; } .admin-sidebar-label, .admin-sidebar-section { display: none !important; } .admin-main { margin-left: 72px !important; } }
        @media (max-width: 720px) {
          .admin-sidebar { display: none !important; }
          .admin-shell { padding-top: 60px; }
          .admin-main { margin-left: 0 !important; }
          .admin-header { display: none !important; }
          .admin-content { padding: 16px 14px 28px !important; }
          .admin-card { border-radius: 12px !important; }
          .admin-table-wrap { overflow: visible !important; }
          .admin-table { min-width: 0 !important; border-collapse: separate; border-spacing: 0 12px; }
          .admin-table thead { display: none; }
          .admin-table tbody { display: block; padding: 10px; }
          .admin-table tr { display: block; border: 1px solid #eee8f0; border-radius: 12px; background: #fff; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,.03); }
          .admin-table tr + tr { margin-top: 12px; }
          .admin-table td { display: grid; grid-template-columns: minmax(92px, 36%) minmax(0, 1fr); gap: 10px; align-items: start; padding: 10px 12px; border-bottom: 1px solid #f5f0f4; overflow-wrap: anywhere; }
          .admin-table td:last-child { border-bottom: none; }
          .admin-table td::before { content: attr(data-label); color: #7a7179; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
          .admin-table td:not([data-label]) { display: block; }
          .admin-table td:not([data-label])::before { content: none; }
          .admin-table td[colspan] { display: block; text-align: center; }
          .admin-table td[colspan]::before { content: none; }
          .admin-row-actions { width: 100%; display: grid !important; grid-template-columns: 1fr; }
          .admin-row-actions .admin-btn-primary,
          .admin-row-actions .admin-btn-ghost,
          .admin-row-actions .admin-btn-danger { width: 100%; }
          .admin-btn-primary, .admin-btn-ghost, .admin-btn-danger { min-height: 42px; }
        }
      `}</style>

      <AdminMobileNav title={title} onLogout={handleLogout} />

      <aside className="admin-sidebar" style={{ width: 240, flexShrink: 0, background: 'linear-gradient(180deg, #1a1218 0%, #100608 100%)', borderRight: '1px solid rgba(255,255,255,.06)', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', inset: '0 auto 0 0', zIndex: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 28px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(221,160,187,.15)', border: '1px solid rgba(221,160,187,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={18} color="#dda0bb" />
          </div>
          <div className="admin-sidebar-label">
            <div style={{ fontSize: 9, letterSpacing: '.22em', color: 'rgba(255,255,255,.35)', textTransform: 'uppercase' }}>Panel admin</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f5edf0', marginTop: 2 }}>Estética Romi Paiva</div>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div className="admin-sidebar-section" style={{ fontSize: 9, letterSpacing: '.18em', color: 'rgba(255,255,255,.28)', textTransform: 'uppercase', padding: '0 14px 8px' }}>Principal</div>
          {NAV_PRINCIPAL.map(({ to, label, icon }) => <SidebarLink key={to} to={to} label={label} icon={icon} pathname={pathname} />)}
          <div className="admin-sidebar-section" style={{ fontSize: 9, letterSpacing: '.18em', color: 'rgba(255,255,255,.28)', textTransform: 'uppercase', padding: '20px 14px 8px' }}>Gestión</div>
          {NAV_GESTION.map(({ to, label, icon }) => <SidebarLink key={to} to={to} label={label} icon={icon} pathname={pathname} />)}
          <div className="admin-sidebar-section" style={{ fontSize: 9, letterSpacing: '.18em', color: 'rgba(255,255,255,.28)', textTransform: 'uppercase', padding: '20px 14px 8px' }}>Reportes</div>
          {NAV_REPORTES.map(({ to, label, icon }) => <SidebarLink key={to} to={to} label={label} icon={icon} pathname={pathname} />)}
        </nav>

        <button type="button" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', borderRadius: 10, border: 'none', background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.6)', fontSize: 13, cursor: 'pointer' }}>
          <LogOut size={16} />
          <span className="admin-sidebar-label">Cerrar sesión</span>
        </button>
      </aside>

      <main className="admin-main" style={{ flex: 1, marginLeft: 240, minWidth: 0 }}>
        <header className="admin-header" style={{ background: '#fff', borderBottom: '1px solid #ece8ef', padding: '22px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon size={22} color="#b8638e" />
            <h1 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 26, color: '#1a1218' }}>{title}</h1>
          </div>
        </header>
        <div className="admin-content" style={{ padding: '24px 32px 32px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="admin-card" style={{ padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#777' }}>
      <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
      Cargando...
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorState({ message }) {
  return <div style={{ padding: 16, borderRadius: 12, border: '1px solid #f1b8b8', background: '#fff5f5', color: '#9a3b3b' }}>{message}</div>;
}

function EmptyState({ message }) {
  return <div className="admin-card" style={{ padding: 28, color: '#777', textAlign: 'center', fontSize: 14 }}>{message}</div>;
}

export function AdminSection({ type }) {
  const meta = SECTION_META[type] ?? SECTION_META.configuracion;
  const [data, setData] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [servicePrice, setServicePrice] = useState('');
  const [serviceVariablePrice, setServiceVariablePrice] = useState(false);
  const [hoursDraft, setHoursDraft] = useState([]);
  const [saving, setSaving] = useState(false);

  const activeServices = useMemo(() => services.filter((service) => service.active), [services]);
  const completedReservations = useMemo(() => reservations.filter((reservation) => isCompletedStatus(reservation.status)), [reservations]);
  const canceledReservations = useMemo(() => reservations.filter((reservation) => isCanceledStatus(reservation.status)), [reservations]);
  const totalRevenue = useMemo(() => {
    const serviceMap = new Map(services.map((service) => [service.id, service]));
    return completedReservations.reduce((sum, reservation) => {
      const service = serviceMap.get(reservation.serviceId);
      return sum + (service?.price && !service.priceIsVariable ? service.price : 0);
    }, 0);
  }, [completedReservations, services]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        let result = [];
        if (type === 'clientes') result = await fetchClients({ active: true });
        if (type === 'servicios') result = await fetchServices(false);
        if (type === 'horarios') result = await fetchBusinessHours();
        if (type === 'profesionales') result = (await fetchUsers()).filter((user) => ['Admin', 'Recepcionista', 'Profesional', 1, 2, 3].includes(user.role));
        if (type === 'finanzas') {
          const [reservationData, serviceData] = await Promise.all([fetchReservations(), fetchServices(false)]);
          if (!cancelled) {
            setReservations(reservationData);
            setServices(serviceData);
          }
        }
        if (type === 'configuracion') {
          const [serviceData, hourData] = await Promise.all([fetchServices(false), fetchBusinessHours()]);
          result = { serviceData, hourData };
        }
        if (!cancelled) {
          setData(Array.isArray(result) ? result : []);
          if (type === 'horarios' && Array.isArray(result)) setHoursDraft(result.map((hour) => ({ ...hour, openingTime: toTimeInput(hour.openingTime), closingTime: toTimeInput(hour.closingTime) })));
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError('No pudimos cargar esta sección. Revisá permisos y conexión con la API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [type]);

  const toggleService = async (service) => {
    try {
      setSaving(true);
      await updateServiceStatus(service.id, !service.active);
      setData((prev) => prev.map((item) => (item.id === service.id ? { ...item, active: !item.active } : item)));
    } catch (err) {
      setError(err.response?.data?.error ?? 'No se pudo actualizar el servicio.');
    } finally {
      setSaving(false);
    }
  };

  const startPriceEdit = (service) => {
    setEditingServiceId(service.id);
    setServicePrice(service.price ?? '');
    setServiceVariablePrice(Boolean(service.priceIsVariable));
  };

  const savePrice = async (service) => {
    const parsedPrice = servicePrice === '' ? null : Number(servicePrice);
    if (parsedPrice != null && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
      setError('Ingresá un precio válido.');
      return;
    }

    try {
      setSaving(true);
      const updated = await updateService(service.id, {
        name: service.name,
        description: service.description,
        category: service.category,
        durationMinutes: service.durationMinutes,
        price: parsedPrice,
        priceIsVariable: serviceVariablePrice,
        eyelashServiceKind: service.eyelashServiceKind,
      });
      setData((prev) => prev.map((item) => (item.id === service.id ? updated : item)));
      setEditingServiceId(null);
    } catch (err) {
      setError(err.response?.data?.error ?? 'No se pudo guardar el precio.');
    } finally {
      setSaving(false);
    }
  };

  const saveHours = async () => {
    try {
      setSaving(true);
      const updated = await updateBusinessHours(hoursDraft.map((hour) => ({
        dayOfWeek: hour.dayOfWeek,
        openingTime: `${hour.openingTime}:00`,
        closingTime: `${hour.closingTime}:00`,
        active: hour.active,
      })));
      setData(updated);
      setHoursDraft(updated.map((hour) => ({ ...hour, openingTime: toTimeInput(hour.openingTime), closingTime: toTimeInput(hour.closingTime) })));
    } catch (err) {
      setError(err.response?.data?.error ?? 'No se pudieron guardar los horarios.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title={meta.title} icon={meta.icon}>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}

      {!loading && !error && type === 'clientes' && (
        <div className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Cliente</th><th>Celular</th><th>Email</th><th>Estado</th></tr></thead>
              <tbody>{data.map((client) => <tr key={client.id}><td data-label="Cliente">{client.firstName} {client.lastName}</td><td data-label="Celular">{client.phone}</td><td data-label="Email">{client.email || '—'}</td><td data-label="Estado">{client.active ? 'Activo' : 'Inactivo'}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && type === 'servicios' && (
        data.length === 0 ? <EmptyState message="No hay servicios cargados para administrar." /> : (
          <div className="admin-card">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Servicio</th><th>Categoria</th><th>Duracion</th><th>Precio</th><th>Estado</th><th>Accion</th></tr></thead>
                <tbody>{data.map((service) => {
                  const editing = editingServiceId === service.id;
                  return (
                    <tr key={service.id}>
                      <td data-label="Servicio">{service.name || 'Servicio sin nombre'}</td>
                      <td data-label="Categoria">{getCategoryLabel(service.category)}</td>
                      <td data-label="Duracion">{formatDuration(service.durationMinutes)}</td>
                      <td data-label="Precio">
                        {editing ? (
                          <div style={{ display: 'grid', gap: 6 }}>
                            <input className="admin-input" inputMode="decimal" value={servicePrice} onChange={(event) => setServicePrice(event.target.value)} placeholder="Precio" disabled={serviceVariablePrice} />
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#666' }}>
                              <input type="checkbox" checked={serviceVariablePrice} onChange={(event) => setServiceVariablePrice(event.target.checked)} /> Precio a consultar
                            </label>
                          </div>
                        ) : formatPrice(service)}
                      </td>
                      <td data-label="Estado">{service.active ? 'Activo' : 'Inactivo'}</td>
                      <td data-label="Accion">
                        <div className="admin-row-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {editing ? (
                            <>
                              <button type="button" className="admin-btn-primary" disabled={saving} onClick={() => savePrice(service)}><Save size={14} /> Guardar</button>
                              <button type="button" className="admin-btn-ghost" disabled={saving} onClick={() => setEditingServiceId(null)}>Cancelar</button>
                            </>
                          ) : (
                            <>
                              <button type="button" className="admin-btn-ghost" disabled={saving} onClick={() => startPriceEdit(service)}><Pencil size={14} /> Precio</button>
                              <button type="button" className="admin-btn-ghost" disabled={saving} onClick={() => toggleService(service)}>{service.active ? 'Desactivar' : 'Activar'}</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          </div>
        )
      )}

      {!loading && !error && type === 'horarios' && (
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 16, borderBottom: '1px solid #f0ecf2', flexWrap: 'wrap' }}>
            <div><strong style={{ color: '#333' }}>Horarios de atención</strong><div style={{ color: '#777', fontSize: 12, marginTop: 3 }}>Estos horarios determinan los turnos disponibles para clientes.</div></div>
            <button type="button" className="admin-btn-primary" disabled={saving} onClick={saveHours}><Save size={15} /> {saving ? 'Guardando...' : 'Guardar horarios'}</button>
          </div>
          <table className="admin-table">
            <thead><tr><th>Día</th><th>Apertura</th><th>Cierre</th><th>Estado</th></tr></thead>
            <tbody>{hoursDraft.slice().sort((a, b) => Number(a.dayOfWeek) - Number(b.dayOfWeek)).map((hour) => <tr key={hour.id ?? hour.dayOfWeek}><td data-label="Dia">{DAY_LABELS[Number(hour.dayOfWeek)] ?? String(hour.dayOfWeek)}</td><td data-label="Apertura"><input className="admin-input" type="time" value={hour.openingTime} disabled={!hour.active} onChange={(event) => setHoursDraft((prev) => prev.map((item) => item.dayOfWeek === hour.dayOfWeek ? { ...item, openingTime: event.target.value } : item))} /></td><td data-label="Cierre"><input className="admin-input" type="time" value={hour.closingTime} disabled={!hour.active} onChange={(event) => setHoursDraft((prev) => prev.map((item) => item.dayOfWeek === hour.dayOfWeek ? { ...item, closingTime: event.target.value } : item))} /></td><td data-label="Estado"><label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><input type="checkbox" checked={hour.active} onChange={(event) => setHoursDraft((prev) => prev.map((item) => item.dayOfWeek === hour.dayOfWeek ? { ...item, active: event.target.checked } : item))} /> {hour.active ? 'Atiende' : 'Cerrado'}</label></td></tr>)}</tbody>
          </table>
        </div>
      )}

      {!loading && !error && type === 'profesionales' && (
        <div className="admin-card">
          <table className="admin-table">
            <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th></tr></thead>
            <tbody>{data.map((user) => <tr key={user.id}><td data-label="Nombre">{user.firstName} {user.lastName}</td><td data-label="Email">{user.email}</td><td data-label="Rol">{String(user.role)}</td><td data-label="Estado">{user.active ? 'Activo' : 'Inactivo'}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      {!loading && !error && type === 'finanzas' && (
        <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="admin-card" style={{ padding: 22 }}><div style={{ color: '#777', fontSize: 13 }}>Turnos registrados</div><strong style={{ fontSize: 30 }}>{reservations.length}</strong></div>
          <div className="admin-card" style={{ padding: 22 }}><div style={{ color: '#777', fontSize: 13 }}>Turnos realizados</div><strong style={{ fontSize: 30 }}>{completedReservations.length}</strong></div>
          <div className="admin-card" style={{ padding: 22 }}><div style={{ color: '#777', fontSize: 13 }}>Turnos cancelados</div><strong style={{ fontSize: 30 }}>{canceledReservations.length}</strong></div>
          <div className="admin-card" style={{ padding: 22 }}><div style={{ color: '#777', fontSize: 13 }}>Servicios activos</div><strong style={{ fontSize: 30 }}>{activeServices.length}</strong></div>
          <div className="admin-card" style={{ padding: 22 }}><div style={{ color: '#777', fontSize: 13 }}>Ingresos realizados con precio fijo</div><strong style={{ fontSize: 30 }}>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(totalRevenue)}</strong></div>
        </div>
      )}

      {!loading && !error && type === 'configuracion' && (
        <div className="admin-card" style={{ padding: 24, color: '#555', lineHeight: 1.7 }}>
          <strong>Configuración lista.</strong>
          <p style={{ margin: '8px 0 0' }}>Las opciones sensibles como dominio, API, Google y WhatsApp se manejan desde variables de entorno del servidor para poder desplegar sin exponer secretos.</p>
        </div>
      )}
    </AdminLayout>
  );
}
