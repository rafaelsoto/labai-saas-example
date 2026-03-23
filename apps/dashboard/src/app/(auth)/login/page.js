'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (err) {
      setError(err.message || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className={styles.title}>Entrar</h1>
      <p className={styles.subtitle}>Bem-vindo de volta</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className={styles.passwordWrapper}>
          <Input
            id="password"
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className={styles.eyeBtn}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <Button type="submit" loading={loading} size="lg" className={styles.submitBtn}>
          Entrar
        </Button>
      </form>

      <div className={styles.links}>
        <Link href="/forgot-password" className={styles.link}>
          Esqueci minha senha
        </Link>
        <span className={styles.divider}>•</span>
        <Link href="/register" className={styles.link}>
          Criar conta
        </Link>
      </div>
    </div>
  );
}
