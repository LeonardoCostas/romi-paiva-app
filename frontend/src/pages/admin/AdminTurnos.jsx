import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Loader2, Plus } from 'lucide-react';
import {
  cancelReservation,
  completeReservation,
  confirmReservation,
  createReservation,
  fetchClients,
  fetchReservations,
  fetchServices,
  markReservationAbsent,
} from '../../services/bookingApi';
import { formatDateLabel, formatDuration, formatPrice, formatTimeLabel, getStatusLabel, normalizeStatus } from '../../utils/booking';
import { AdminLayout } from './AdminSection';

export default function AdminTurnos() {
  const [reservations, setReservations] = useState([]);
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ clientId: '', serviceId: '', date: '', startTime: '', notes: '' });

  const servicesMap = useMemo(() => new Map(services.map((service) => [service.id, service])), [services]);
  const clientsMap = useMemo(() => new Map(clients.map((client) => [client.id, client])), [clients]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reservationData, serviceData, clientData] = await Promise.all([
        fetchReservations(),
        fetchServices(true),
        fetchClients({ active: true }),
      ]);
      setReservations([...reservationData].sort((a, b) => `${b.date} ${b.startTime}`.localeCompare(`${a.date} ${a.startTime}`)));
      setServices(serviceData);
      setClients(clientData);
    } catch (err) {
      console.error(err);
      setError('No pudimos cargar los turnos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const runAction = async (action) => {
    setSaving(true);
    setError(null);
    try {
      await action();
      await load();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error ?? 'No se pudo completar la acción.');
    } finally {
      setSaving(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    await runAction(async () => {
      await createReservation({
        clientId: form.clientId,
        serviceId: form.serviceId,
        date: form.date,
        startTime: form.startTime,
        notes: form.notes || null,
      });
      setForm({ clientId: '', serviceId: '', date: '', startTime: '', notes: '' });
      setShowForm(false);
    });
  };

  return (
    <AdminLayout title="Turnos" icon={ClipboardList}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <p style={{ margin: 0, color: '#777', fontSize: 14 }}>{reservations.length} turnos registrados</p>
        <button type="button" className="admin-btn-primary" onClick={() => setShowForm((value) => !value)}>
          <Plus size={16} />
          Nuevo turno
        </button>
      </div>

      {error && <div style={{ marginBottom: 16, padding: 14, borderRadius: 12, background: '#fff5f5', border: '1px solid #f1b8b8', color: '#9a3b3b' }}>{error}</div>}

      {showForm && (
        <form onSubmit={submit} className="admin-card" style={{ padding: 18, marginBottom: 18, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <select className="admin-input" value={form.clientId} onChange={(event) => setForm({ ...form, clientId: event.target.value })} required>
            <option value="">Cliente</option>
            {clients.map((client) => <option key={client.id} value={client.id}>{client.firstName} {client.lastName}</option>)}
          </select>
          <select className="admin-input" value={form.serviceId} onChange={(event) => setForm({ ...form, serviceId: event.target.value })} required>
            <option value="">Servicio</option>
            {services.map((service) => <option key={service.id} value={service.id}>{service.name} · {formatDuration(service.durationMinutes)}</option>)}
          </select>
          <input className="admin-input" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
          <input className="admin-input" type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} required />
          <input className="admin-input" placeholder="Notas" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          <button type="submit" className="admin-btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Crear turno'}</button>
        </form>
      )}

      {loading ? (
        <div className="admin-card" style={{ padding: 32, display: 'flex', justifyContent: 'center', gap: 10, color: '#777' }}>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
          Cargando turnos...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div className="admin-card">
          <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Horario</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', color: '#888', padding: 28 }}>No hay turnos cargados.</td></tr>}
              {reservations.map((reservation) => {
                const service = servicesMap.get(reservation.serviceId);
                const client = clientsMap.get(reservation.clientId);
                const status = normalizeStatus(reservation.status);
                const canConfirm = status === 'Pendiente';
                const canComplete = status === 'Confirmada';
                const canCancel = status === 'Pendiente' || status === 'Confirmada';
                const canMarkAbsent = status === 'Pendiente' || status === 'Confirmada';

                return (
                  <tr key={reservation.id}>
                    <td data-label="Fecha">{formatDateLabel(reservation.date)}</td>
                    <td data-label="Cliente">{client ? `${client.firstName} ${client.lastName}` : 'Cliente'}</td>
                    <td data-label="Servicio">{service?.name ?? 'Servicio'}<br /><span style={{ color: '#888' }}>{service ? formatPrice(service) : ''}</span></td>
                    <td>{formatTimeLabel(reservation.startTime)} - {formatTimeLabel(reservation.endTime)}</td>
                    <td data-label="Estado">{getStatusLabel(status)}</td>
                    <td data-label="Acciones">
                      <div className="admin-row-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {canConfirm && <button type="button" className="admin-btn-ghost" disabled={saving} onClick={() => runAction(() => confirmReservation(reservation.id))}>Confirmar</button>}
                        {canComplete && <button type="button" className="admin-btn-ghost" disabled={saving} onClick={() => runAction(() => completeReservation(reservation.id))}>Realizado</button>}
                        {canMarkAbsent && <button type="button" className="admin-btn-ghost" disabled={saving} onClick={() => runAction(() => markReservationAbsent(reservation.id))}>Ausente</button>}
                        {canCancel && <button type="button" className="admin-btn-danger" disabled={saving} onClick={() => runAction(() => cancelReservation(reservation.id))}>Cancelar</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
