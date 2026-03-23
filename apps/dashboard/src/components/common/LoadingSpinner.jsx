import styles from './LoadingSpinner.module.css';

export function LoadingSpinner({ size = 'md' }) {
  return <div className={`${styles.spinner} ${styles[size]}`} />;
}
