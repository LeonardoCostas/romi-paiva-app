import { Link, useNavigate } from 'react-router-dom';
import { clearSession, getToken, isStaffRole } from '../utils/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const token = getToken();
  const staff = isStaffRole();

  const handleLogout = () => {
    clearSession();
    navigate('/');
    window.location.reload();
  };

  const linkStyle = {
    color: 'rgba(255,255,255,.75)',
    textDecoration: 'none',
    fontSize: 13,
    letterSpacing: '.04em',
  };

  return (
    <nav
      style={{
        padding: '18px 52px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,.06)',
      }}
    >
      <Link to="/" style={{ color: '#f0e0c0', fontSize: '18px', fontWeight: 'bold', textDecoration: 'none' }}>
        ROMI PAIVA
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Link to="/servicios" style={linkStyle}>
          Servicios y precios
        </Link>

        {!token ? (
          <>
            <Link to="/reservar" style={linkStyle}>
              Reservar turno
            </Link>
            <Link to="/login" style={{ ...linkStyle, color: '#dda0bb' }}>
              Iniciar sesión
            </Link>
          </>
        ) : staff ? (
          <>
            <Link to="/admin/agenda" style={{ ...linkStyle, color: '#dda0bb' }}>
              Panel admin
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13 }}
            >
              Salir
            </button>
          </>
        ) : (
          <>
            <Link to="/reservar" style={linkStyle}>
              Reservar turno
            </Link>
            <Link to="/mis-turnos" style={linkStyle}>
              Mis turnos
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13 }}
            >
              Salir
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
