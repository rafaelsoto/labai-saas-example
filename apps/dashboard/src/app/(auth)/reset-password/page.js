'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import styles from './reset.module.css';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Senhas não conferem'); return; }
    if (password.length < 6) { setError('Senha deve ter ao menos 6 caracteres'); return; }
    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
      setTimeout(() => router.replace('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Token inválido ou expirado');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className={styles.success}>
        <div className={styles.successIcon}>✅</div>
        <h2>Senha redefinida!</h2>
        <p>Redirecionando para o login...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles.title}>Nova senha</h1>
      <p className={styles.subtitle}>Defina sua nova senha</p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input id="password" label="Nova senha" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Input id="confirm" label="Confirmar senha" type="password" placeholder="Repita a senha" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        {error && <p className={styles.error}>{error}</p>}
        <Button type="submit" loading={loading} size="lg" className={styles.submitBtn}>Redefinir senha</Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
