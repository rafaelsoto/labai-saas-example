'use client';
import { useAuth } from '../../hooks/useAuth';
import styles from './Topbar.module.css';

export function Topbar({ unreadCount = 0 }) {
  const { user } = useAuth();

  return (
    <header className={styles.topbar}>
      <div className={styles.left} />
      <div className={styles.right}>
        {unreadCount > 0 && (
          <div className={styles.notification}>
            <span>🔔</span>
            <span className={styles.badge}>{unreadCount}</span>
          </div>
        )}
        <div className={styles.user}>
          <div className={styles.avatar}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className={styles.userName}>{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
