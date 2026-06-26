import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getToken, getUserRole, isStaffRole } from '../utils/auth';

export default function ProtectedRoute({ staffOnly = false, clientOnly = false }) {
  const token = getToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  const role = getUserRole();

  if (staffOnly && !isStaffRole(role)) {
    return <Navigate to="/" replace />;
  }

  if (clientOnly && isStaffRole(role)) {
    return <Navigate to="/admin/agenda" replace />;
  }

  return <Outlet />;
}
