import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { clearSession, getToken, isStaffRole } from '../utils/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const token = getToken();
  const staff = isStaffRole();
  const [menuOpen, setMenuOpen] = useState(false);

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
      className="site-navbar"
      style={{
        padding: '18px 52px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,.06)',
      }}
    >
      <style>{`
        .site-nav-toggle, .site-mobile-menu { display: none; }
        @media (max-width: 640px) {
          .site-navbar { padding: 14px 18px !important; position: relative; z-index: 40; }
          .site-nav-desktop { display: none !important; }
          .site-nav-toggle { display: inline-flex; width: 40px; height: 40px; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,.16); border-radius: 10px; background: rgba(255,255,255,.05); color: #fff; }
          .site-mobile-menu { display: grid; position: absolute; top: calc(100% + 8px); right: 14px; left: 14px; gap: 8px; padding: 12px; border: 1px solid rgba(255,255,255,.1); border-radius: 12px; background: #1a0c12; box-shadow: 0 18px 42px rgba(0,0,0,.42); }
          .site-mobile-menu a, .site-mobile-menu button { min-height: 42px; display: flex; align-items: center; padding: 0 12px; border: 0; border-radius: 8px; background: rgba(255,255,255,.05); color: rgba(255,255,255,.85); font: inherit; font-size: 13px; text-align: left; text-decoration: none; }
          .site-mobile-menu a:last-child { color: #f1b1cc; }
        }
      `}</style>
      <Link to="/" style={{ color: '#f0e0c0', fontSize: '18px', fontWeight: 'bold', textDecoration: 'none' }}>
        ROMI PAIVA
      </Link>

      <div className="site-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
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

      <button type="button" className="site-nav-toggle" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}>
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {menuOpen && (
        <div className="site-mobile-menu">
          <Link to="/servicios" onClick={() => setMenuOpen(false)}>Servicios y precios</Link>
          <Link to="/reservar" onClick={() => setMenuOpen(false)}>Reservar turno</Link>
          {!token && <Link to="/login" onClick={() => setMenuOpen(false)}>Iniciar sesión</Link>}
          {token && staff && <Link to="/admin/agenda" onClick={() => setMenuOpen(false)}>Panel admin</Link>}
          {token && !staff && <Link to="/mis-turnos" onClick={() => setMenuOpen(false)}>Mis turnos</Link>}
          {token && <button type="button" onClick={handleLogout}>Salir</button>}
        </div>
      )}
    </nav>
  );
}
