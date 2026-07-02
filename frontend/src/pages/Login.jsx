import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api';
import { clearSession, getPostLoginPath, isStaffRole } from '../utils/auth';

export default function Login() {
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

      setErrorMessage(response?.data?.error ?? 'Error al iniciar sesion con Google.');
    } catch (error) {
      console.error('Error al validar el token de Google en el Backend:', error);
      setErrorMessage(error.response?.data?.error ?? 'Error al iniciar sesion con Google. Revisa el Google Client ID del backend.');
    }
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #100608 0%, #070204 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ position: 'absolute', width: 360, height: 360, background: 'rgba(184, 99, 142, 0.16)', filter: 'blur(110px)', top: '8%', left: '12%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 280, height: 280, background: 'rgba(200, 160, 96, 0.08)', filter: 'blur(95px)', bottom: '12%', right: '10%', pointerEvents: 'none' }} />

      <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: '58px 50px', width: '100%', maxWidth: 500, minHeight: 410, boxShadow: '0 24px 64px rgba(0,0,0,0.6)', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: 34 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: '#f5edf0', fontSize: 42, margin: '0 0 12px', fontWeight: 700, lineHeight: 1.1 }}>¡Hola de nuevo!</h1>
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 16, margin: 0, lineHeight: 1.5 }}>Ingresá a tu espacio Estética Romi Paiva</p>
        </div>

        {errorMessage && (
          <div style={{ marginBottom: 24, padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(232,93,93,.35)', background: 'rgba(232,93,93,.1)', color: '#f5c4c4', fontSize: 13, lineHeight: 1.45 }}>
            {errorMessage}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', margin: '26px 0 30px', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ color: 'rgba(255,255,255,0.32)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Continuar con
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setErrorMessage('No se pudo iniciar sesion con Google.')}
            theme="filled_dark"
            shape="pill"
            locale="es"
          />
        </div>
      </div>
    </div>
  );
}
