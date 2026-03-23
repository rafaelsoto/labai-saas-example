'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import styles from './Sidebar.module.css';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: '◉' },
  { href: '/projects', label: 'Projetos', icon: '⬡' },
  { href: '/analytics', label: 'Analytics', icon: '◈' },
  { href: '/settings', label: 'Configurações', icon: '⚙' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>◈</span>
        <span className={styles.logoText}>FeedbackFlow</span>
      </div>

      <nav className={styles.nav}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.navLink} ${pathname === link.href || pathname.startsWith(link.href + '/') ? styles.active : ''}`}
          >
            <span className={styles.navIcon}>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      <button className={styles.logoutBtn} onClick={logout}>
        <span>⎋</span>
        <span>Sair</span>
      </button>
    </aside>
  );
}
