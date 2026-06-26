import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const register = async (e) => {
    e.preventDefault();
    const parts = nombre.trim().split(/\s+/);
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ") || firstName;

    try {
      const response = await api.post("/v1/auth/register", {
        firstName,
        lastName,
        phone: telefono,
        email,
        password,
      });

      if (response.data?.success && response.data.data?.token) {
        localStorage.setItem("token", response.data.data.token);
        navigate("/mis-turnos");
        return;
      }

      alert(response.data?.error ?? "No se pudo completar el registro");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error ?? "Error al registrar");
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #100608 0%, #070204 100%)',
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden', fontFamily: "'Inter', sans-serif"
    }}>
      {/* Luces de neón de fondo */}
      <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'rgba(184, 99, 142, 0.15)', filter: 'blur(100px)', top: '10%', left: '15%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '250px', height: '250px', background: 'rgba(200, 160, 96, 0.08)', filter: 'blur(90px)', bottom: '15%', right: '10%', pointerEvents: 'none' }} />

      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '40px',
        width: '100%', maxWidth: '400px', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', position: 'relative', zIndex: 10
      }}>
        {/* Título */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: '#f5edf0', fontSize: '32px', margin: '0 0 6px', fontWeight: 700 }}>Crear Cuenta</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0, letterSpacing: '0.02em' }}>Registrate para gestionar tus turnos premium</p>
        </div>

        <form onSubmit={register} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: 600 }}>Nombre Completo</label>
            <input
              type="text"
              placeholder="Ej: Laura Cardozo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 16px', color: '#fff', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = '#dda0bb'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: 600 }}>Email</label>
            <input
              type="email"
              placeholder="tuemail@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 16px', color: '#fff', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = '#dda0bb'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: 600 }}>Celular</label>
            <input
              type="tel"
              placeholder="Ej: 11 1234 5678"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
              style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 16px', color: '#fff', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = '#dda0bb'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: 600 }}>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 16px', color: '#fff', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = '#dda0bb'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <button type="submit" style={{
            background: 'linear-gradient(135deg, #dda0bb 0%, #b8638e 100%)',
            color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', marginTop: '10px', boxShadow: '0 4px 20px rgba(180,90,140,0.25)'
          }}>
            Registrarme
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>¿Ya tenés cuenta? </span>
          <Link to="/login" style={{ color: '#dda0bb', textDecoration: 'none', fontWeight: 500 }}>Iniciá sesión</Link>
        </div>
      </div>
    </div>
  );
}
