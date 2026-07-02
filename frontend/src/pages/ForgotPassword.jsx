import { useState } from 'react';
import api from '../services/api';
import { AuthButton, AuthCard, AuthInput, FooterLink, Notice } from '../components/AuthShell';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await api.post('/v1/auth/forgot-password', { email });
      setMessage(response.data?.data?.message ?? 'Si el email esta registrado, te enviamos un enlace.');
    } catch (error) {
      console.error(error);
      setErrorMessage(error.response?.data?.error ?? 'No pudimos procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Recuperar contrasena" subtitle="Ingresa tu email y te enviaremos un enlace seguro.">
      {message && <Notice tone="success">{message}</Notice>}
      {errorMessage && <Notice tone="error">{errorMessage}</Notice>}
      <form onSubmit={submit} style={{ display: 'grid', gap: 18 }}>
        <AuthInput type="email" required placeholder="tuemail@ejemplo.com" value={email} onChange={(event) => setEmail(event.target.value)} />
        <AuthButton loading={loading}>{loading ? 'Enviando...' : 'Enviar enlace'}</AuthButton>
      </form>
      <FooterLink to="/login">Volver al login</FooterLink>
    </AuthCard>
  );
}
