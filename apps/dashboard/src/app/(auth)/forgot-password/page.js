'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import styles from './forgot.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Erro ao enviar email');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className={styles.success}>
        <div className={styles.successIcon}>✉️</div>
        <h2>Email enviado!</h2>
        <p>Se o email existir em nossa base, você receberá um link para redefinir sua senha.</p>
        <Link href="/login" className={styles.backLink}>Voltar ao login</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles.title}>Recuperar senha</h1>
      <p className={styles.subtitle}>Informe seu email para receber o link</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <Input id="email" label="Email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {error && <p className={styles.error}>{error}</p>}
        <Button type="submit" loading={loading} size="lg" className={styles.submitBtn}>Enviar link</Button>
      </form>

      <p className={styles.backLink2}>
        <Link href="/login" className={styles.link}>← Voltar ao login</Link>
      </p>
    </div>
  );
}
