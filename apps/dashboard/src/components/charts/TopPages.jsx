'use client';
import styles from './charts.module.css';

export function TopPages({ data = [] }) {
  if (data.length === 0) {
    return <div className={styles.empty}>Sem dados para exibir</div>;
  }

  const max = Math.max(...data.map((d) => d.count));

  return (
    <div className={styles.topPages}>
      {data.map((page, i) => (
        <div key={i} className={styles.pageRow}>
          <div className={styles.pageInfo}>
            <span className={styles.pageRank}>#{i + 1}</span>
            <span className={styles.pageUrl} title={page.url}>
              {page.url.replace(/^https?:\/\//, '').substring(0, 50)}
            </span>
          </div>
          <div className={styles.pageBar}>
            <div
              className={styles.pageBarFill}
              style={{ width: `${(page.count / max) * 100}%` }}
            />
          </div>
          <div className={styles.pageStats}>
            <span>{page.count}</span>
            <span className={styles.pageAvg}>★ {parseFloat(page.avgRating).toFixed(1)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
