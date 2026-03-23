import styles from './Tooltip.module.css';

export function Tooltip({ text, children }) {
  return (
    <div className={styles.wrapper}>
      {children}
      <span className={styles.tooltip}>{text}</span>
    </div>
  );
}
