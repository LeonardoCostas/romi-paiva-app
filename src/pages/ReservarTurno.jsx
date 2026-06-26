import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle2, Clock, Loader2, Sparkles, User } from 'lucide-react';
import { getUserEmail, getUserName } from '../utils/auth';
import {
  filterPastSlots,
  formatDateLabel,
  formatDuration,
  formatPrice,
  formatTimeLabel,
  generateTimeSlots,
  getAvailableDates,
  getCategoryLabel,
  getOpenDays,
  splitFullName,
} from '../utils/booking';
import {
  createReservation,
  fetchBusinessHours,
  fetchMyProfile,
  fetchServices,
  loadAvailableSlots,
  upsertMyProfile,
} from '../services/bookingApi';

const STEPS = ['Perfil', 'Servicio', 'Fecha y hora', 'Confirmar'];

function hasCompleteContactProfile(profile) {
  return Boolean(profile?.firstName?.trim() && profile?.lastName?.trim() && profile?.phone?.trim());
}

export default function ReservarTurno() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('serviceId');

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [services, setServices] = useState([]);
  const [businessHours, setBusinessHours] = useState([]);
  const [clientProfile, setClientProfile] = useState(null);

  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '', notes: '' });
  const [selectedServiceId, setSelectedServiceId] = useState(preselectedServiceId || '');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const openDaysMap = useMemo(() => getOpenDays(businessHours), [businessHours]);
  const availableDates = useMemo(() => getAvailableDates(openDaysMap), [openDaysMap]);
  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? null,
    [services, selectedServiceId],
  );

  useEffect(() => {
    async function bootstrap() {
      setLoading(true);
      setError(null);

      try {
        const [servicesData, hoursData] = await Promise.all([fetchServices(true), fetchBusinessHours()]);
        setServices(servicesData);
        setBusinessHours(hoursData);

        const defaultName = splitFullName(getUserName());
        setProfileForm((prev) => ({
          ...prev,
          firstName: defaultName.firstName,
          lastName: defaultName.lastName,
        }));

        try {
          const profile = await fetchMyProfile();
          setClientProfile(profile);
          setProfileForm({
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
            notes: profile.notes ?? '',
          });
          setStep(hasCompleteContactProfile(profile) ? (preselectedServiceId ? 2 : 1) : 0);
        } catch {
          setClientProfile(null);
          setStep(0);
        }
      } catch (err) {
        console.error(err);
        setError('No pudimos cargar la información para reservar. Verificá que la API esté activa.');
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [preselectedServiceId]);

  useEffect(() => {
    if (preselectedServiceId && services.some((service) => service.id === preselectedServiceId)) {
      setSelectedServiceId(preselectedServiceId);
    }
  }, [preselectedServiceId, services]);

  useEffect(() => {
    async function loadSlots() {
      if (!selectedService || !selectedDate || !openDaysMap.size) {
        setAvailableSlots([]);
        return;
      }

      const [y, m, d] = selectedDate.split('-').map(Number);
      const dayHours = openDaysMap.get(new Date(y, m - 1, d).getDay());
      if (!dayHours) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      setSelectedTime('');

      try {
        const candidates = filterPastSlots(
          selectedDate,
          generateTimeSlots(dayHours.openingTime, dayHours.closingTime, selectedService.durationMinutes),
        );
        const slots = await loadAvailableSlots(selectedService.id, selectedDate, candidates);
        setAvailableSlots(slots);
      } catch (err) {
        console.error(err);
        setError('No pudimos consultar los horarios disponibles.');
      } finally {
        setLoadingSlots(false);
      }
    }

    loadSlots();
  }, [selectedService, selectedDate, openDaysMap]);

  useEffect(() => {
    if (step === 2 && !selectedDate && availableDates.length > 0) {
      setSelectedDate(availableDates[0]);
    }
  }, [step, selectedDate, availableDates]);

  const saveProfile = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const profile = await upsertMyProfile({
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        phone: profileForm.phone.trim(),
        birthDate: null,
        notes: profileForm.notes.trim() || null,
      });
      setClientProfile(profile);
      setStep(selectedServiceId ? 2 : 1);
    } catch (err) {
      setError(err.response?.data?.error ?? 'No pudimos guardar tu perfil.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmReservation = async () => {
    if (!clientProfile || !selectedService || !selectedDate || !selectedTime) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await createReservation({
        clientId: clientProfile.id,
        serviceId: selectedService.id,
        date: selectedDate,
        startTime: selectedTime,
        notes: notes.trim() || null,
      });

      if (response?.success) {
        setSuccess(response.data);
        setStep(4);
        return;
      }

      setError(response?.error ?? 'No se pudo crear la reserva.');
    } catch (err) {
      setError(err.response?.data?.error ?? 'No se pudo crear la reserva.');
    } finally {
      setSubmitting(false);
    }
  };

  const canContinueProfile = profileForm.firstName.trim() && profileForm.lastName.trim() && profileForm.phone.trim();
  const canSkipProfile = hasCompleteContactProfile(clientProfile);
  const canContinueService = Boolean(selectedServiceId);
  const canContinueSchedule = Boolean(selectedDate && selectedTime);

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#f5edf0', padding: '32px 24px 64px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        .rt-card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08); border-radius: 20px; padding: 24px; }
        .rt-input {
          width: 100%; background: rgba(0,0,0,.25); border: 1px solid rgba(255,255,255,.1);
          border-radius: 12px; padding: 14px 16px; color: #fff; font-size: 14px; outline: none;
        }
        .rt-input:focus { border-color: #dda0bb; }
        .rt-btn-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #dda0bb 0%, #b8638e 100%);
          color: #fff; border: none; border-radius: 12px; padding: 14px 22px;
          font-size: 14px; font-weight: 600; cursor: pointer;
        }
        .rt-btn-primary:disabled { opacity: .45; cursor: not-allowed; }
        .rt-btn-ghost {
          background: rgba(255,255,255,.06); color: #fff; border: 1px solid rgba(255,255,255,.12);
          border-radius: 12px; padding: 14px 22px; font-size: 14px; cursor: pointer;
        }
        .rt-option {
          text-align: left; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08);
          border-radius: 14px; padding: 16px; color: #fff; cursor: pointer; transition: .2s;
        }
        .rt-option.active, .rt-option:hover { border-color: rgba(221,160,187,.45); background: rgba(221,160,187,.08); }
        .rt-slot {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1);
          border-radius: 10px; padding: 10px 12px; color: #fff; cursor: pointer;
        }
        .rt-slot.active, .rt-slot:hover { border-color: #dda0bb; background: rgba(221,160,187,.12); }
      `}</style>

      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <Link to="/servicios" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#dda0bb', textDecoration: 'none', marginBottom: 24 }}>
          <ArrowLeft size={16} /> Volver a servicios
        </Link>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, margin: '0 0 8px' }}>Reservar turno</h1>
        <p style={{ color: 'rgba(255,255,255,.5)', margin: '0 0 28px' }}>
          Completá los pasos para confirmar tu cita en Estética Romi Paiva.
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
          {STEPS.map((label, index) => (
            <div
              key={label}
              style={{
                padding: '8px 14px',
                borderRadius: 100,
                fontSize: 12,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                background: step >= index ? 'rgba(221,160,187,.15)' : 'rgba(255,255,255,.04)',
                color: step >= index ? '#f5edf0' : 'rgba(255,255,255,.35)',
                border: `1px solid ${step >= index ? 'rgba(221,160,187,.35)' : 'rgba(255,255,255,.08)'}`,
              }}
            >
              {index + 1}. {label}
            </div>
          ))}
        </div>

        {loading && (
          <div className="rt-card" style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,.6)' }}>
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            Preparando reserva...
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && (
          <div style={{ marginBottom: 20, padding: '14px 18px', borderRadius: 12, background: 'rgba(232,93,93,.1)', border: '1px solid rgba(232,93,93,.25)', color: '#f5c4c4' }}>
            {error}
          </div>
        )}

        {!loading && step === 0 && (
          <div className="rt-card">
            <h2 style={{ margin: '0 0 8px', fontSize: 22 }}>Tus datos de contacto</h2>
            <p style={{ margin: '0 0 20px', color: 'rgba(255,255,255,.45)', fontSize: 14 }}>
              Los usamos para confirmar tu turno. Email de cuenta: {getUserEmail() || '—'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <label style={{ display: 'block' }}>
                <span style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(255,255,255,.45)', marginBottom: 8 }}>Nombre</span>
                <input className="rt-input" value={profileForm.firstName} onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })} />
              </label>
              <label style={{ display: 'block' }}>
                <span style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(255,255,255,.45)', marginBottom: 8 }}>Apellido</span>
                <input className="rt-input" value={profileForm.lastName} onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })} />
              </label>
              <label style={{ display: 'block' }}>
                <span style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(255,255,255,.45)', marginBottom: 8 }}>Teléfono</span>
                <input className="rt-input" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="11 1234 5678" />
              </label>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button type="button" className="rt-btn-primary" disabled={!canContinueProfile || submitting} onClick={saveProfile}>
                {submitting ? 'Guardando...' : 'Continuar'}
              </button>
              {canSkipProfile && (
                <button type="button" className="rt-btn-ghost" onClick={() => setStep(1)}>
                  Saltar
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && step === 1 && (
          <div className="rt-card">
            <h2 style={{ margin: '0 0 20px', fontSize: 22 }}>Elegí un servicio</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  className={`rt-option${selectedServiceId === service.id ? ' active' : ''}`}
                  onClick={() => setSelectedServiceId(service.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>{service.name}</div>
                      <div style={{ fontSize: 12, color: '#e8a4c0', marginTop: 4 }}>{getCategoryLabel(service.category)}</div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: 13 }}>
                      <div style={{ fontWeight: 600 }}>{formatPrice(service)}</div>
                      <div style={{ color: 'rgba(255,255,255,.45)', marginTop: 4 }}>{formatDuration(service.durationMinutes)}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button type="button" className="rt-btn-ghost" onClick={() => setStep(0)}>Atrás</button>
              <button type="button" className="rt-btn-primary" disabled={!canContinueService} onClick={() => setStep(2)}>
                Continuar
              </button>
            </div>
          </div>
        )}

        {!loading && step === 2 && selectedService && (
          <div className="rt-card">
            <h2 style={{ margin: '0 0 8px', fontSize: 22 }}>Elegí fecha y horario</h2>
            <p style={{ margin: '0 0 20px', color: 'rgba(255,255,255,.45)' }}>
              {selectedService.name} · {formatDuration(selectedService.durationMinutes)}
            </p>

            <label style={{ display: 'block', marginBottom: 20 }}>
              <span style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(255,255,255,.45)', marginBottom: 8 }}>Fecha</span>
              <select
                className="rt-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                <option value="">Seleccioná una fecha</option>
                {availableDates.map((date) => (
                  <option key={date} value={date}>{formatDateLabel(date)}</option>
                ))}
              </select>
            </label>

            {selectedDate && (
              <div>
                <span style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(255,255,255,.45)', marginBottom: 10 }}>Horarios disponibles</span>
                {loadingSlots ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,.5)' }}>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Buscando horarios...
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p style={{ color: 'rgba(255,255,255,.45)' }}>No hay horarios disponibles para esa fecha. Probá otro día.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 10 }}>
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={`rt-slot${selectedTime === slot ? ' active' : ''}`}
                        onClick={() => setSelectedTime(slot)}
                      >
                        {formatTimeLabel(slot)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button type="button" className="rt-btn-ghost" onClick={() => setStep(1)}>Atrás</button>
              <button type="button" className="rt-btn-primary" disabled={!canContinueSchedule} onClick={() => setStep(3)}>
                Continuar
              </button>
            </div>
          </div>
        )}

        {!loading && step === 3 && selectedService && (
          <div className="rt-card">
            <h2 style={{ margin: '0 0 20px', fontSize: 22 }}>Confirmá tu reserva</h2>

            <div style={{ display: 'grid', gap: 14, marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><User size={16} color="#dda0bb" /> {profileForm.firstName} {profileForm.lastName} · {profileForm.phone}</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Sparkles size={16} color="#dda0bb" /> {selectedService.name} · {formatPrice(selectedService)}</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Calendar size={16} color="#dda0bb" /> {formatDateLabel(selectedDate)}</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Clock size={16} color="#dda0bb" /> {formatTimeLabel(selectedTime)} · {formatDuration(selectedService.durationMinutes)}</div>
            </div>

            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(255,255,255,.45)', marginBottom: 8 }}>Notas (opcional)</span>
              <textarea className="rt-input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Algún detalle que quieras contarnos..." />
            </label>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button type="button" className="rt-btn-ghost" onClick={() => setStep(2)}>Atrás</button>
              <button type="button" className="rt-btn-primary" disabled={submitting} onClick={confirmReservation}>
                {submitting ? 'Confirmando...' : 'Confirmar reserva'}
              </button>
            </div>
          </div>
        )}

        {!loading && step === 4 && success && (
          <div className="rt-card" style={{ textAlign: 'center' }}>
            <CheckCircle2 size={48} color="#4caf7d" style={{ marginBottom: 16 }} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", margin: '0 0 10px' }}>¡Turno reservado!</h2>
            <p style={{ color: 'rgba(255,255,255,.55)', marginBottom: 24 }}>
              Tu reserva quedó registrada como pendiente de confirmación.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button type="button" className="rt-btn-primary" onClick={() => navigate('/mis-turnos')}>
                Ver mis turnos
              </button>
              <Link to="/servicios" className="rt-btn-ghost" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                Volver a servicios
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
