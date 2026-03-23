'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import styles from './register.module.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  function validate() {
    const errs = {};
    if (form.name.length < 2) errs.name = 'Nome deve ter ao menos 2 caracteres';
    if (!form.email.includes('@')) errs.email = 'Email inválido';
    if (form.password.length < 6) errs.password = 'Senha deve ter ao menos 6 caracteres';
    if (form.password !== form.confirm) errs.confirm = 'Senhas não conferem';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      router.replace('/dashboard');
    } catch (err) {
      setApiError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div>
      <h1 className={styles.title}>Criar conta</h1>
      <p className={styles.subtitle}>Comece a coletar feedbacks hoje</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <Input id="name" label="Nome" placeholder="Seu nome" value={form.name} onChange={set('name')} error={errors.name} required />
        <Input id="email" label="Email" type="email" placeholder="seu@email.com" value={form.email} onChange={set('email')} error={errors.email} required />
        <Input id="password" label="Senha" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={set('password')} error={errors.password} required />
        <Input id="confirm" label="Confirmar senha" type="password" placeholder="Repita a senha" value={form.confirm} onChange={set('confirm')} error={errors.confirm} required />

        {apiError && <p className={styles.error}>{apiError}</p>}

        <Button type="submit" loading={loading} size="lg" className={styles.submitBtn}>
          Criar conta
        </Button>
      </form>

      <p className={styles.loginLink}>
        Já tem conta?{' '}
        <Link href="/login" className={styles.link}>Entrar</Link>
      </p>
    </div>
  );
}
