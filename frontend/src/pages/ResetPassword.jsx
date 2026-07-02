import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { AuthButton, AuthCard, AuthInput, FooterLink, Notice } from '../components/AuthShell';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token') ?? '';

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await api.post('/v1/auth/reset-password', { token, password });
      setMessage(response.data?.data?.message ?? 'Contrasena actualizada.');
      setPassword('');
    } catch (error) {
      console.error(error);
      setErrorMessage(error.response?.data?.error ?? 'No pudimos restablecer la contrasena.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Nueva contrasena" subtitle="Crea una contrasena nueva para volver a ingresar.">
      {!token && <Notice tone="error">El enlace no tiene token de seguridad.</Notice>}
      {message && <Notice tone="success">{message}</Notice>}
      {errorMessage && <Notice tone="error">{errorMessage}</Notice>}
      <form onSubmit={submit} style={{ display: 'grid', gap: 18 }}>
        <AuthInput type="password" required minLength={6} placeholder="Nueva contrasena" value={password} onChange={(event) => setPassword(event.target.value)} disabled={!token} />
        <AuthButton loading={loading} disabled={!token}>{loading ? 'Guardando...' : 'Guardar contrasena'}</AuthButton>
      </form>
      <FooterLink to="/login">Volver al login</FooterLink>
    </AuthCard>
  );
}
