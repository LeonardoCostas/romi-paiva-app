import api from './api';
import { fallbackBusinessHours, fallbackServices } from '../data/bookingFallback';

export async function fetchServices(active = true) {
  try {
    const response = await api.get('/v1/services', { params: { active } });
    return response.data?.data ?? [];
  } catch (error) {
    if (active) return fallbackServices;
    throw error;
  }
}

export async function fetchBusinessHours() {
  try {
    const response = await api.get('/v1/business-hours');
    return response.data?.data ?? [];
  } catch {
    return fallbackBusinessHours;
  }
}

export async function fetchMyProfile() {
  const response = await api.get('/v1/clients/me');
  return response.data?.data ?? null;
}

export async function upsertMyProfile(payload) {
  const response = await api.put('/v1/clients/me', payload);
  return response.data?.data;
}

export async function checkAvailability(serviceId, date, startTime) {
  const response = await api.get('/v1/reservations/availability', {
    params: {
      serviceId,
      date,
      startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
    },
  });
  return response.data?.data;
}

export async function createReservation(payload) {
  const response = await api.post('/v1/reservations', {
    ...payload,
    startTime: payload.startTime.length === 5 ? `${payload.startTime}:00` : payload.startTime,
  });
  return response.data;
}

export async function fetchMyReservations() {
  const response = await api.get('/v1/reservations/mine');
  return response.data?.data ?? [];
}

export async function fetchReservations(params = {}) {
  const response = await api.get('/v1/reservations', { params });
  return response.data?.data ?? [];
}

export async function fetchClients(params = {}) {
  const response = await api.get('/v1/clients', { params });
  return response.data?.data ?? [];
}

export async function cancelReservation(id) {
  const response = await api.patch(`/v1/reservations/${id}/cancel`);
  return response.data;
}

export async function confirmReservation(id) {
  const response = await api.patch(`/v1/reservations/${id}/confirm`);
  return response.data;
}

export async function completeReservation(id) {
  const response = await api.patch(`/v1/reservations/${id}/complete`);
  return response.data;
}

export async function updateServiceStatus(id, active) {
  const response = await api.patch(`/v1/services/${id}/status`, { active });
  return response.data;
}

export async function fetchUsers() {
  const response = await api.get('/v1/users');
  return response.data?.data ?? [];
}

export async function loadAvailableSlots(serviceId, date, slots) {
  let checkedApi = false;
  const checks = await Promise.all(
    slots.map(async (slot) => {
      try {
        const result = await checkAvailability(serviceId, date, slot);
        checkedApi = true;
        return result?.available ? slot : null;
      } catch {
        return null;
      }
    }),
  );

  const available = checks.filter(Boolean);
  return checkedApi ? available : slots.slice(0, 10);
}
