import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getToken, getUserRole, isStaffRole } from '../utils/auth';

function AccessDenied() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: '#100608',
        color: '#f5edf0',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <section
        style={{
          maxWidth: 460,
          width: '100%',
          padding: 28,
          borderRadius: 18,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.04)',
          textAlign: 'center',
          boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
        }}
      >
        <h1 style={{ margin: '0 0 10px', fontSize: 28 }}>Acceso denegado</h1>
        <p style={{ margin: '0 0 22px', color: 'rgba(255,255,255,0.66)', lineHeight: 1.6 }}>
          Tu usuario esta autenticado, pero no tiene permisos de administrador para ingresar al panel.
        </p>
        <a
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 42,
            padding: '0 18px',
            borderRadius: 999,
            background: '#dda0bb',
            color: '#100608',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Volver al inicio
        </a>
      </section>
    </main>
  );
}

export default function ProtectedRoute({ staffOnly = false, clientOnly = false }) {
  const token = getToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  const role = getUserRole();

  if (staffOnly && !isStaffRole(role)) {
    return <AccessDenied />;
  }

  if (clientOnly && isStaffRole(role)) {
    return <Navigate to="/admin/agenda" replace />;
  }

  return <Outlet />;
}
