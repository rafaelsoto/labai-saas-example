import { AuthProvider } from '../../contexts/AuthContext';
import styles from './auth.module.css';

export default function AuthLayout({ children }) {
  return (
    <AuthProvider>
      <div className={styles.layout}>
        <div className={styles.background} />
        <div className={styles.card}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>◈</span>
            <span className={styles.logoText}>FeedbackFlow</span>
          </div>
          {children}
        </div>
      </div>
    </AuthProvider>
  );
}
