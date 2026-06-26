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
  Scissors,
  Settings,
  User,
  Users,
} from 'lucide-react';
import {
  fetchBusinessHours,
  fetchClients,
  fetchReservations,
  fetchServices,
  fetchUsers,
  updateServiceStatus,
} from '../../services/bookingApi';
import { clearSession } from '../../utils/auth';
import { formatDuration, formatPrice, formatTimeLabel, getCategoryLabel } from '../../utils/booking';

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

function SidebarLink({ to, label, icon: Icon, pathname }) {
  const active = pathname === to || (to !== '/admin/dashboard' && pathname.startsWith(to));
  return (
    <Link to={to} className="admin-sidebar-link" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#fff' : 'rgba(255,255,255,.55)', background: active ? 'rgba(255,255,255,.1)' : 'transparent' }}>
      <Icon size={16} />
      <span className="admin-sidebar-label">{label}</span>
    </Link>
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
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f4f2f5', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .admin-sidebar-link:hover { background: rgba(255,255,255,.06) !important; color: rgba(255,255,255,.85) !important; }
        .admin-btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: none; border-radius: 10px; padding: 10px 16px; background: linear-gradient(135deg, #dda0bb 0%, #b8638e 100%); color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; }
        .admin-btn-ghost { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid #e5e0ea; border-radius: 10px; padding: 9px 14px; background: #fff; color: #555; font-size: 13px; cursor: pointer; text-decoration: none; }
        .admin-btn-danger { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid #f1b8b8; border-radius: 10px; padding: 9px 14px; background: #fff5f5; color: #a64444; font-size: 13px; cursor: pointer; }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .admin-table th { text-align: left; color: #777; font-weight: 600; background: #faf9fb; border-bottom: 1px solid #eee8f0; padding: 12px 14px; }
        .admin-table td { border-bottom: 1px solid #f0ecf2; padding: 13px 14px; color: #333; vertical-align: top; }
        .admin-card { background: #fff; border: 1px solid #ece8ef; border-radius: 14px; box-shadow: 0 2px 12px rgba(0,0,0,.04); overflow: hidden; }
        .admin-input { width: 100%; border: 1px solid #e5e0ea; border-radius: 10px; padding: 10px 12px; font-size: 13px; outline: none; }
        .admin-input:focus { border-color: #cda0bc; }
        @media (max-width: 1100px) { .admin-sidebar { width: 72px !important; padding: 20px 10px !important; } .admin-sidebar-label, .admin-sidebar-section { display: none !important; } .admin-main { margin-left: 72px !important; } }
        @media (max-width: 720px) { .admin-sidebar { display: none !important; } .admin-main { margin-left: 0 !important; } .admin-header, .admin-content { padding-left: 18px !important; padding-right: 18px !important; } }
      `}</style>

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

export function AdminSection({ type }) {
  const meta = SECTION_META[type] ?? SECTION_META.configuracion;
  const [data, setData] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const activeServices = useMemo(() => services.filter((service) => service.active), [services]);
  const totalRevenue = useMemo(() => {
    const serviceMap = new Map(services.map((service) => [service.id, service]));
    return reservations.reduce((sum, reservation) => {
      const service = serviceMap.get(reservation.serviceId);
      return sum + (service?.price && !service.priceIsVariable ? service.price : 0);
    }, 0);
  }, [reservations, services]);

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
        if (!cancelled) setData(result);
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
    await updateServiceStatus(service.id, !service.active);
    setData((prev) => prev.map((item) => (item.id === service.id ? { ...item, active: !item.active } : item)));
  };

  return (
    <AdminLayout title={meta.title} icon={meta.icon}>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}

      {!loading && !error && type === 'clientes' && (
        <div className="admin-card">
          <table className="admin-table">
            <thead><tr><th>Cliente</th><th>Celular</th><th>Email</th><th>Estado</th></tr></thead>
            <tbody>{data.map((client) => <tr key={client.id}><td>{client.firstName} {client.lastName}</td><td>{client.phone}</td><td>{client.email || '—'}</td><td>{client.active ? 'Activo' : 'Inactivo'}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      {!loading && !error && type === 'servicios' && (
        <div className="admin-card">
          <table className="admin-table">
            <thead><tr><th>Servicio</th><th>Categoría</th><th>Duración</th><th>Precio</th><th>Estado</th><th>Acción</th></tr></thead>
            <tbody>{data.map((service) => <tr key={service.id}><td>{service.name}</td><td>{getCategoryLabel(service.category)}</td><td>{formatDuration(service.durationMinutes)}</td><td>{formatPrice(service)}</td><td>{service.active ? 'Activo' : 'Inactivo'}</td><td><button type="button" className="admin-btn-ghost" onClick={() => toggleService(service)}>{service.active ? 'Desactivar' : 'Activar'}</button></td></tr>)}</tbody>
          </table>
        </div>
      )}

      {!loading && !error && type === 'horarios' && (
        <div className="admin-card">
          <table className="admin-table">
            <thead><tr><th>Día</th><th>Apertura</th><th>Cierre</th><th>Estado</th></tr></thead>
            <tbody>{data.map((hour) => <tr key={hour.id ?? hour.dayOfWeek}><td>{String(hour.dayOfWeek)}</td><td>{formatTimeLabel(hour.openingTime)}</td><td>{formatTimeLabel(hour.closingTime)}</td><td>{hour.active ? 'Atiende' : 'Cerrado'}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      {!loading && !error && type === 'profesionales' && (
        <div className="admin-card">
          <table className="admin-table">
            <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th></tr></thead>
            <tbody>{data.map((user) => <tr key={user.id}><td>{user.firstName} {user.lastName}</td><td>{user.email}</td><td>{String(user.role)}</td><td>{user.active ? 'Activo' : 'Inactivo'}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      {!loading && !error && type === 'finanzas' && (
        <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="admin-card" style={{ padding: 22 }}><div style={{ color: '#777', fontSize: 13 }}>Turnos registrados</div><strong style={{ fontSize: 30 }}>{reservations.length}</strong></div>
          <div className="admin-card" style={{ padding: 22 }}><div style={{ color: '#777', fontSize: 13 }}>Servicios activos</div><strong style={{ fontSize: 30 }}>{activeServices.length}</strong></div>
          <div className="admin-card" style={{ padding: 22 }}><div style={{ color: '#777', fontSize: 13 }}>Ingresos con precio fijo</div><strong style={{ fontSize: 30 }}>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(totalRevenue)}</strong></div>
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
