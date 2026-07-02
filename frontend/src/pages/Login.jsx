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
      <div style={{ position: 'absolute', width: 300, height: 300, background: 'rgba(184, 99, 142, 0.15)', filter: 'blur(100px)', top: '10%', left: '15%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 250, height: 250, background: 'rgba(200, 160, 96, 0.08)', filter: 'blur(90px)', bottom: '15%', right: '10%', pointerEvents: 'none' }} />

      <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: 40, width: '100%', maxWidth: 400, boxShadow: '0 24px 64px rgba(0,0,0,0.6)', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: '#f5edf0', fontSize: 32, margin: '0 0 6px', fontWeight: 700 }}>Ingresar</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>Accede con Google para reservar turnos o administrar el panel.</p>
        </div>

        {errorMessage && (
          <div style={{ marginBottom: 18, padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(232,93,93,.35)', background: 'rgba(232,93,93,.1)', color: '#f5c4c4', fontSize: 13, lineHeight: 1.45 }}>
            {errorMessage}
          </div>
        )}

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
