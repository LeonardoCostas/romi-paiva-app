export const CATEGORY_LABELS = {
  1: 'Peluquería',
  2: 'Uñas',
  3: 'Pestañas',
  Peluqueria: 'Peluquería',
  Unias: 'Uñas',
  Pestanias: 'Pestañas',
};

export const STATUS_LABELS = {
  1: 'Pendiente',
  2: 'Confirmado',
  3: 'Cancelado',
  4: 'Realizado',
  5: 'Ausente',
  Pendiente: 'Pendiente',
  Confirmada: 'Confirmado',
  Cancelada: 'Cancelado',
  Completada: 'Realizado',
  Ausente: 'Ausente',
};

export const STATUS_COLORS = {
  Pendiente: '#f5c842',
  Confirmada: '#4caf7d',
  Confirmado: '#4caf7d',
  Cancelada: '#e85d5d',
  Cancelado: '#e85d5d',
  Completada: '#5b8def',
  Realizado: '#5b8def',
  Ausente: '#9ca3af',
  1: '#f5c842',
  2: '#4caf7d',
  3: '#e85d5d',
  4: '#5b8def',
  5: '#9ca3af',
};

export function normalizeStatus(status) {
  const value = String(status ?? '').toLowerCase();
  if (value === '1' || value.includes('pend')) return 'Pendiente';
  if (value === '2' || value.includes('confirm')) return 'Confirmada';
  if (value === '3' || value.includes('cancel')) return 'Cancelada';
  if (value === '4' || value.includes('complet') || value.includes('realiz')) return 'Completada';
  if (value === '5' || value.includes('ausente')) return 'Ausente';
  return String(status ?? '');
}

export function isCompletedStatus(status) {
  return normalizeStatus(status) === 'Completada';
}

export function isCanceledStatus(status) {
  return normalizeStatus(status) === 'Cancelada';
}

export function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] ?? 'Otro';
}

export function getStatusLabel(status) {
  return STATUS_LABELS[status] ?? String(status);
}

export function getStatusColor(status) {
  return STATUS_COLORS[status] ?? '#888';
}

export function formatDuration(minutes) {
  if (!minutes) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h} h ${m} min`;
  if (h) return `${h} h`;
  return `${m} min`;
}

export function formatPrice(service) {
  if (service?.priceIsVariable) return 'Precio según tratamiento';
  if (service?.price == null) return 'Consultar';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(service.price);
}

export function toDateOnly(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseTimeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function formatTimeLabel(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return `${String(h).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
}

export function formatTimeForApi(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return `${String(h).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}:00`;
}

export function formatDateLabel(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function generateTimeSlots(openingTime, closingTime, durationMinutes, stepMinutes = 30) {
  const open = parseTimeToMinutes(openingTime);
  const close = parseTimeToMinutes(closingTime);
  const slots = [];

  for (let start = open; start + durationMinutes <= close; start += stepMinutes) {
    const h = Math.floor(start / 60);
    const m = start % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }

  return slots;
}

export function splitFullName(fullName) {
  if (!fullName?.trim()) return { firstName: '', lastName: '' };
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ') || parts[0],
  };
}

export function getOpenDays(businessHours) {
  const dayMap = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const map = new Map();
  businessHours.forEach((hour) => {
    if (!hour.active) return;
    const key = typeof hour.dayOfWeek === 'number' ? hour.dayOfWeek : dayMap[hour.dayOfWeek];
    if (key != null) map.set(key, hour);
  });
  return map;
}

export function getAvailableDates(openDaysMap, daysAhead = 45) {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < daysAhead; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    if (openDaysMap.has(date.getDay())) {
      dates.push(toDateOnly(date));
    }
  }

  return dates;
}

export function filterPastSlots(dateStr, slots) {
  const todayStr = toDateOnly(new Date());
  if (dateStr !== todayStr) return slots;

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return slots.filter((slot) => parseTimeToMinutes(slot) > nowMinutes);
}
