import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const register = async (event) => {
    event.preventDefault();
    setMessage('');
    setErrorMessage('');
    setLoading(true);

    const parts = nombre.trim().split(/\s+/);
    const firstName = parts[0] ?? '';
    const lastName = parts.slice(1).join(' ') || firstName;

    try {
      const response = await api.post('/v1/auth/register', {
        firstName,
        lastName,
        phone: telefono,
        email,
        password,
      });

      if (response.data?.success) {
        setMessage(response.data.data?.message ?? 'Te enviamos un email para confirmar tu cuenta.');
        setPassword('');
        return;
      }

      setErrorMessage(response.data?.error ?? 'No se pudo completar el registro.');
    } catch (error) {
      console.error(error);
      setErrorMessage(error.response?.data?.error ?? 'Error al registrar.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '14px 16px',
    color: '#fff',
    fontSize: 14,
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 8,
    fontWeight: 600,
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #100608 0%, #070204 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ position: 'absolute', width: 300, height: 300, background: 'rgba(184, 99, 142, 0.15)', filter: 'blur(100px)', top: '10%', left: '15%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 250, height: 250, background: 'rgba(200, 160, 96, 0.08)', filter: 'blur(90px)', bottom: '15%', right: '10%', pointerEvents: 'none' }} />

      <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: 40, width: '100%', maxWidth: 400, boxShadow: '0 24px 64px rgba(0,0,0,0.6)', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: '#f5edf0', fontSize: 32, margin: '0 0 6px', fontWeight: 700 }}>Crear cuenta</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0, letterSpacing: '0.02em' }}>Registrate para gestionar tus turnos premium</p>
        </div>

        {message && (
          <div style={{ marginBottom: 18, padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(76,175,125,.35)', background: 'rgba(76,175,125,.1)', color: '#c7f4d8', fontSize: 13, lineHeight: 1.45 }}>
            {message}
          </div>
        )}

        {errorMessage && (
          <div style={{ marginBottom: 18, padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(232,93,93,.35)', background: 'rgba(232,93,93,.1)', color: '#f5c4c4', fontSize: 13, lineHeight: 1.45 }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={register} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>Nombre completo</label>
            <input type="text" placeholder="Ej: Laura Cardozo" value={nombre} onChange={(event) => setNombre(event.target.value)} required style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" placeholder="tuemail@ejemplo.com" value={email} onChange={(event) => setEmail(event.target.value)} required style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Celular</label>
            <input type="tel" placeholder="Ej: 11 1234 5678" value={telefono} onChange={(event) => setTelefono(event.target.value)} required style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Contrasena</label>
            <input type="password" placeholder="********" value={password} onChange={(event) => setPassword(event.target.value)} required style={inputStyle} />
          </div>

          <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #dda0bb 0%, #b8638e 100%)', color: '#fff', border: 'none', borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 600, cursor: loading ? 'default' : 'pointer', opacity: loading ? .72 : 1, marginTop: 10, boxShadow: '0 4px 20px rgba(180,90,140,0.25)' }}>
            {loading ? 'Enviando...' : 'Registrarme'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13 }}>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Ya tenes cuenta? </span>
          <Link to="/login" style={{ color: '#dda0bb', textDecoration: 'none', fontWeight: 500 }}>Inicia sesion</Link>
        </div>
      </div>
    </div>
  );
}
