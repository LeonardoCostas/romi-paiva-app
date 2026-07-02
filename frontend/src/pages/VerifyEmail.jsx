import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { AuthCard, FooterLink, Notice } from '../components/AuthShell';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Confirmando email...');
  const [errorMessage, setErrorMessage] = useState('');
  const token = searchParams.get('token') ?? '';

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!token) {
        setMessage('');
        setErrorMessage('El enlace no tiene token de confirmacion.');
        return;
      }

      try {
        const response = await api.post('/v1/auth/verify-email', { token });
        if (!cancelled) setMessage(response.data?.data?.message ?? 'Email confirmado.');
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setMessage('');
          setErrorMessage(error.response?.data?.error ?? 'No pudimos confirmar el email.');
        }
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthCard title="Confirmacion de email" subtitle="Validamos tu cuenta para proteger tus turnos.">
      {message && <Notice tone="success">{message}</Notice>}
      {errorMessage && <Notice tone="error">{errorMessage}</Notice>}
      <FooterLink to="/login">Ir al login</FooterLink>
    </AuthCard>
  );
}
