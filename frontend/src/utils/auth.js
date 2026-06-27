import { jwtDecode } from 'jwt-decode';

const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

export const ROLES = {
  ADMIN: 'Admin',
  RECEPCIONISTA: 'Recepcionista',
  PROFESIONAL: 'Profesional',
  CLIENTE: 'Cliente',
};

const ADMIN_ROLE_VALUES = new Set(['Admin', '1']);

export function getToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
      clearSession();
      return null;
    }
    return token;
  } catch {
    clearSession();
    return null;
  }
}

export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

export function getUserRole() {
  const decoded = getUserFromToken();
  if (!decoded) return null;

  return decoded.role ?? decoded[ROLE_CLAIM] ?? null;
}

export function isStaffRole(role = getUserRole()) {
  if (role == null) return false;
  return ADMIN_ROLE_VALUES.has(String(role));
}

export function isClienteRole(role = getUserRole()) {
  if (role == null) return false;
  const value = String(role);
  return value === ROLES.CLIENTE || value === '4';
}

export function getPostLoginPath(role) {
  return isStaffRole(role) ? '/admin/agenda' : '/mis-turnos';
}

export function getUserEmail() {
  const decoded = getUserFromToken();
  if (!decoded) return '';
  return decoded.email ?? decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ?? '';
}

export function getUserName() {
  const decoded = getUserFromToken();
  if (!decoded) return '';
  return decoded.name ?? decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ?? '';
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('clientProfile');
}
