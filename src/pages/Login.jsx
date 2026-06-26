import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api';
import { clearSession, getPostLoginPath, isStaffRole } from '../utils/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfterLogin = (role) => {
    const from = location.state?.from;
    if (from && !isStaffRole(role)) {
      navigate(from);
      return;
    }
    navigate(getPostLoginPath(role));
  };

  const login = async (event) => {
    event.preventDefault();
    clearSession();
    setErrorMessage('');

    try {
      const response = await api.post('/v1/auth/login', { email, password });

      if (response.data?.success && response.data.data?.token) {
        const { token, role } = response.data.data;
        localStorage.setItem('token', token);
        redirectAfterLogin(role);
        return;
      }

      setErrorMessage(response.data?.error ?? 'Credenciales incorrectas.');
    } catch (error) {
      console.error('Error en login tradicional:', error);
      setErrorMessage(error.response?.data?.error ?? 'No pudimos iniciar sesión. Verificá email, contraseña y que la API esté activa.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    clearSession();
    setErrorMessage('');

    try {
      const response = await api.post('/v1/auth/google', { IdToken: credentialResponse.credential });

      if (response?.data?.success && response.data.data?.token) {
        const { token, role } = response.data.data;
        localStorage.setItem('token', token);
        redirectAfterLogin(role);
        return;
      }

      setErrorMessage(response?.data?.error ?? 'Error al iniciar sesión con Google.');
    } catch (error) {
      console.error('Error al validar el token de Google en el Backend:', error);
      setErrorMessage(error.response?.data?.error ?? 'Error al iniciar sesión con Google. Revisá el Google Client ID del backend.');
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #100608 0%, #070204 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ position: 'absolute', width: 300, height: 300, background: 'rgba(184, 99, 142, 0.15)', filter: 'blur(100px)', top: '10%', left: '15%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 250, height: 250, background: 'rgba(200, 160, 96, 0.08)', filter: 'blur(90px)', bottom: '15%', right: '10%', pointerEvents: 'none' }} />

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          backdropFilter: 'blur(20px)',
          borderRadius: 24,
          padding: 40,
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: '#f5edf0', fontSize: 32, margin: '0 0 6px', fontWeight: 700 }}>
            ¡Hola de nuevo!
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0, letterSpacing: '0.02em' }}>
            Ingresá a tu espacio Estética Romi Paiva
          </p>
        </div>

        {errorMessage && (
          <div style={{ marginBottom: 18, padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(232,93,93,.35)', background: 'rgba(232,93,93,.1)', color: '#f5c4c4', fontSize: 13, lineHeight: 1.45 }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 600 }}>
              Email
            </label>
            <input
              type="email"
              placeholder="tuemail@ejemplo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 14, outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 600 }}>
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 14, outline: 'none' }}
            />
          </div>

          <button type="submit" style={{ background: 'linear-gradient(135deg, #dda0bb 0%, #b8638e 100%)', color: '#fff', border: 'none', borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 10, boxShadow: '0 4px 20px rgba(180,90,140,0.25)' }}>
            Ingresar
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            O continuar con
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setErrorMessage('No se pudo iniciar sesión con Google. Probá con email y contraseña.')}
            theme="filled_dark"
            shape="pill"
            locale="es"
          />
        </div>

        <div style={{ textAlign: 'center', marginTop: 28, fontSize: 13 }}>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>¿No tenés cuenta? </span>
          <Link to="/register" style={{ color: '#dda0bb', textDecoration: 'none', fontWeight: 500 }}>
            Registrate acá
          </Link>
        </div>
      </div>
    </div>
  );
}
