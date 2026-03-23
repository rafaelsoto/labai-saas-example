'use client';
import { FeedbackCard } from './FeedbackCard';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../common/EmptyState';
import styles from './FeedbackList.module.css';

export function FeedbackList({
  feedbacks,
  pagination,
  loading,
  projectId,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onPageChange,
}) {
  if (loading) {
    return (
      <div className={styles.list}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height={120} className={styles.skeleton} />
        ))}
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <EmptyState
        icon="💬"
        title="Nenhum feedback encontrado"
        description="Tente ajustar os filtros ou aguarde novos feedbacks chegarem."
      />
    );
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <p className={styles.count}>
          Mostrando {feedbacks.length} de {pagination.total} feedbacks
        </p>
        {projectId && (
          <Button variant="secondary" size="sm" onClick={() => onMarkAllRead(projectId)}>
            Marcar todos como lidos
          </Button>
        )}
      </div>

      <div className={styles.list}>
        {feedbacks.map((f) => (
          <FeedbackCard
            key={f.id}
            feedback={f}
            onMarkRead={onMarkRead}
            onDelete={onDelete}
          />
        ))}
      </div>

      {pagination.pages > 1 && (
        <div className={styles.pagination}>
          <Button
            variant="secondary"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            ← Anterior
          </Button>
          <span className={styles.pageInfo}>
            {pagination.page} / {pagination.pages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={pagination.page >= pagination.pages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Próxima →
          </Button>
        </div>
      )}
    </div>
  );
}
