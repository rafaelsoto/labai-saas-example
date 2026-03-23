import styles from './Table.module.css';

export function Table({ children, className = '' }) {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <table className={styles.table}>{children}</table>
    </div>
  );
}
