import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ClipboardList, DollarSign, Loader2, Scissors, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchClients, fetchReservations, fetchServices } from '../../services/bookingApi';
import { formatDateLabel, formatPrice, formatTimeLabel, getStatusLabel } from '../../utils/booking';
import { AdminLayout } from './AdminSection';

function toToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function normalizeStatus(status) {
  const value = String(status).toLowerCase();
  if (value === '1' || value.includes('pend')) return 'Pendiente';
  if (value === '2' || value.includes('confirm')) return 'Confirmada';
  if (value === '3' || value.includes('cancel')) return 'Cancelada';
  if (value === '4' || value.includes('complet') || value.includes('realiz')) return 'Completada';
  if (value === '5' || value.includes('ausente')) return 'Ausente';
  return String(status);
}

export default function DashboardAdmin() {
  const [reservations, setReservations] = useState([]);
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [reservationData, serviceData, clientData] = await Promise.all([fetchReservations(), fetchServices(false), fetchClients({ active: true })]);
        if (!cancelled) {
          setReservations(reservationData);
          setServices(serviceData);
          setClients(clientData);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError('No pudimos cargar el resumen del negocio.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const serviceMap = useMemo(() => new Map(services.map((service) => [service.id, service])), [services]);
  const clientMap = useMemo(() => new Map(clients.map((client) => [client.id, client])), [clients]);
  const today = toToday();
  const todayReservations = reservations.filter((reservation) => reservation.date === today);
  const pendingReservations = reservations.filter((reservation) => normalizeStatus(reservation.status) === 'Pendiente');
  const estimatedRevenue = reservations.reduce((total, reservation) => {
    const service = serviceMap.get(reservation.serviceId);
    return total + (service?.price && !service.priceIsVariable ? service.price : 0);
  }, 0);
  const latestReservations = [...reservations].sort((a, b) => `${b.date} ${b.startTime}`.localeCompare(`${a.date} ${a.startTime}`)).slice(0, 5);

  const cards = [
    { label: 'Turnos de hoy', value: todayReservations.length, icon: CalendarDays, to: '/admin/agenda', color: '#b8638e' },
    { label: 'Pendientes', value: pendingReservations.length, icon: ClipboardList, to: '/admin/turnos', color: '#c8a060' },
    { label: 'Clientes activos', value: clients.length, icon: Users, to: '/admin/clientes', color: '#7e9f8f' },
    { label: 'Ingresos estimados', value: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(estimatedRevenue), icon: DollarSign, to: '/admin/finanzas', color: '#8e7ab5' },
  ];

  return (
    <AdminLayout title="Dashboard">
      {loading && <div className="admin-card" style={{ padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#777' }}><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Cargando resumen...<style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style></div>}
      {error && <div style={{ padding: 16, borderRadius: 12, border: '1px solid #f1b8b8', background: '#fff5f5', color: '#9a3b3b' }}>{error}</div>}
      {!loading && !error && <>
        <div style={{ marginBottom: 22 }}><p style={{ margin: 0, color: '#777', fontSize: 14 }}>Resumen operativo del salón para hoy.</p></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 22 }}>
          {cards.map(({ label, value, icon: Icon, to, color }) => <Link key={label} to={to} className="admin-card" style={{ padding: 18, textDecoration: 'none', color: '#222', overflow: 'hidden' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}><div><div style={{ color: '#777', fontSize: 13 }}>{label}</div><strong style={{ display: 'block', marginTop: 8, fontSize: 26, lineHeight: 1.1 }}>{value}</strong></div><div style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: 10, background: `${color}18`, color }}><Icon size={18} /></div></div></Link>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(260px, .8fr)', gap: 18 }} className="admin-dashboard-grid">
          <section className="admin-card"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid #f0ecf2', gap: 12 }}><div><strong>Últimos turnos</strong><div style={{ color: '#777', fontSize: 12, marginTop: 3 }}>Actividad registrada recientemente</div></div><Link to="/admin/turnos" className="admin-btn-ghost">Ver turnos</Link></div><div style={{ overflowX: 'auto' }}><table className="admin-table"><thead><tr><th>Fecha</th><th>Cliente</th><th>Servicio</th><th>Estado</th></tr></thead><tbody>{latestReservations.length === 0 ? <tr><td colSpan="4" style={{ textAlign: 'center', color: '#888', padding: 28 }}>Todavía no hay turnos registrados.</td></tr> : latestReservations.map((reservation) => { const client = clientMap.get(reservation.clientId); const service = serviceMap.get(reservation.serviceId); return <tr key={reservation.id}><td>{formatDateLabel(reservation.date)}<br /><span style={{ color: '#888', fontSize: 12 }}>{formatTimeLabel(reservation.startTime)}</span></td><td>{client ? `${client.firstName} ${client.lastName}` : 'Cliente'}</td><td>{service?.name ?? 'Servicio'}<br /><span style={{ color: '#888', fontSize: 12 }}>{service ? formatPrice(service) : ''}</span></td><td>{getStatusLabel(normalizeStatus(reservation.status))}</td></tr>; })}</tbody></table></div></section>
          <section className="admin-card" style={{ padding: 20 }}><div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}><Scissors size={18} color="#b8638e" /><strong>Acciones rápidas</strong></div><div style={{ display: 'grid', gap: 10 }}><Link to="/admin/turnos" className="admin-btn-primary">Crear turno</Link><Link to="/admin/servicios" className="admin-btn-ghost">Editar servicios y precios</Link><Link to="/admin/horarios" className="admin-btn-ghost">Configurar horarios</Link><Link to="/admin/agenda" className="admin-btn-ghost">Abrir agenda</Link></div></section>
        </div>
      </>}
      <style>{`@media (max-width: 860px) { .admin-dashboard-grid { grid-template-columns: 1fr !important; } }`}</style>
    </AdminLayout>
  );
}
