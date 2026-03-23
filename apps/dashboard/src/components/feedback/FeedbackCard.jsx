'use client';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { timeAgo, truncate } from '../../lib/utils';
import styles from './FeedbackCard.module.css';

const RATING_COLORS = {
  1: 'var(--error)',
  2: '#f97316',
  3: 'var(--warning)',
  4: '#84cc16',
  5: 'var(--success)',
};

export function FeedbackCard({ feedback, onMarkRead, onDelete }) {
  const color = RATING_COLORS[feedback.rating] || 'var(--accent)';
  const stars = '★'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating);

  return (
    <div className={styles.card} style={{ borderLeftColor: color }}>
      <div className={styles.header}>
        <div className={styles.rating}>
          <span className={styles.stars} style={{ color }}>{stars}</span>
          <span className={styles.ratingNum}>{feedback.rating}/5</span>
        </div>
        <div className={styles.badges}>
          {!feedback.is_read && <Badge variant="accent">Novo</Badge>}
          {feedback.project_name && <Badge variant="default">{feedback.project_name}</Badge>}
        </div>
        <span className={styles.time}>{timeAgo(feedback.created_at)}</span>
      </div>

      {feedback.message && (
        <p className={styles.message}>{truncate(feedback.message, 200)}</p>
      )}

      {feedback.page_url && (
        <p className={styles.pageUrl}>
          <span className={styles.pageLabel}>Página:</span>
          {feedback.page_url.replace(/^https?:\/\//, '').substring(0, 80)}
        </p>
      )}

      <div className={styles.actions}>
        {!feedback.is_read && (
          <Button variant="ghost" size="sm" onClick={() => onMarkRead(feedback.id)}>
            Marcar como lido
          </Button>
        )}
        <Button variant="danger" size="sm" onClick={() => onDelete(feedback.id)}>
          Deletar
        </Button>
      </div>
    </div>
  );
}
