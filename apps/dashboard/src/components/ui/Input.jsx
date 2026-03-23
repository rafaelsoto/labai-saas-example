import styles from './Input.module.css';

export function Input({
  label,
  error,
  icon,
  type = 'text',
  id,
  className = '',
  ...props
}) {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <div className={styles.inputWrapper}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input
          id={id}
          type={type}
          className={`${styles.input} ${icon ? styles.withIcon : ''} ${error ? styles.hasError : ''}`}
          {...props}
        />
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
