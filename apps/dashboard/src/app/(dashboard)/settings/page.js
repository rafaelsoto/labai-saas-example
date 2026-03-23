'use client';
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../lib/api';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import styles from './settings.module.css';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', avatar_url: user?.avatar_url || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    try {
      await updateProfile({ name: profile.name, avatar_url: profile.avatar_url || null });
      setProfileMsg('Perfil atualizado com sucesso!');
    } catch (err) {
      setProfileMsg(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPasswordErr('');
    setPasswordMsg('');
    if (passwords.newPassword.length < 6) { setPasswordErr('Nova senha deve ter ao menos 6 caracteres'); return; }
    if (passwords.newPassword !== passwords.confirm) { setPasswordErr('Senhas não conferem'); return; }
    setSavingPassword(true);
    try {
      await api.put('/api/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswordMsg('Senha alterada com sucesso!');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPasswordErr(err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const planVariant = { free: 'default', pro: 'accent', enterprise: 'success' };

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Configurações</h1>

      <Card className={styles.section}>
        <h2 className={styles.sectionTitle}>Perfil</h2>
        <form onSubmit={saveProfile} className={styles.form}>
          <Input label="Nome" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
          <Input label="Email" type="email" value={user?.email || ''} disabled />
          <Input label="URL do Avatar (opcional)" type="url" value={profile.avatar_url} onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })} placeholder="https://..." />
          {profileMsg && <p className={styles.success}>{profileMsg}</p>}
          <Button type="submit" loading={savingProfile}>Salvar perfil</Button>
        </form>
      </Card>

      <Card className={styles.section}>
        <h2 className={styles.sectionTitle}>Trocar Senha</h2>
        <form onSubmit={savePassword} className={styles.form}>
          <Input label="Senha atual" type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
          <Input label="Nova senha" type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required />
          <Input label="Confirmar nova senha" type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} required />
          {passwordErr && <p className={styles.error}>{passwordErr}</p>}
          {passwordMsg && <p className={styles.success}>{passwordMsg}</p>}
          <Button type="submit" loading={savingPassword}>Alterar senha</Button>
        </form>
      </Card>

      <Card className={styles.section}>
        <h2 className={styles.sectionTitle}>Plano Atual</h2>
        <div className={styles.planInfo}>
          <Badge variant={planVariant[user?.plan] || 'default'} className={styles.planBadge}>
            {user?.plan || 'free'}
          </Badge>
          <div className={styles.planDetails}>
            {user?.plan === 'free' && (
              <>
                <p>✓ 1 projeto</p>
                <p>✓ 100 feedbacks/mês</p>
                <p>✓ 30 dias de retenção</p>
              </>
            )}
            {user?.plan === 'pro' && (
              <>
                <p>✓ 10 projetos</p>
                <p>✓ 10.000 feedbacks/mês</p>
                <p>✓ 365 dias de retenção</p>
              </>
            )}
            {user?.plan === 'enterprise' && (
              <>
                <p>✓ Projetos ilimitados</p>
                <p>✓ Feedbacks ilimitados</p>
                <p>✓ Retenção ilimitada</p>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
