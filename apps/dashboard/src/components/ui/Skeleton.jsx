import styles from './Skeleton.module.css';

export function Skeleton({ width, height, className = '' }) {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{ width, height }}
    />
  );
}
