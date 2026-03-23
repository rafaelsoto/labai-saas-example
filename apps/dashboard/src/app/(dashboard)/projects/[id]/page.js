'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../lib/api';
import { useFeedbacks } from '../../../../hooks/useFeedbacks';
import { FeedbackFilters } from '../../../../components/feedback/FeedbackFilters';
import { FeedbackList } from '../../../../components/feedback/FeedbackList';
import { Badge } from '../../../../components/ui/Badge';
import { Skeleton } from '../../../../components/ui/Skeleton';
import styles from './project-feedbacks.module.css';

export default function ProjectFeedbacksPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loadingProject, setLoadingProject] = useState(true);

  const {
    feedbacks, pagination, filters, loading,
    updateFilter, setPage, clearFilters,
    markAsRead, markAllAsRead, deleteFeedback,
  } = useFeedbacks({ projectId: id });

  useEffect(() => {
    api.get(`/api/projects/${id}`)
      .then((data) => setProject(data.project))
      .catch(console.error)
      .finally(() => setLoadingProject(false));
  }, [id]);

  return (
    <div>
      <div className={styles.header}>
        {loadingProject ? (
          <Skeleton width={200} height={28} />
        ) : (
          <>
            <h1 className={styles.title}>{project?.name}</h1>
            {project?.is_active && <Badge variant="success">Ativo</Badge>}
          </>
        )}
      </div>

      <FeedbackFilters
        filters={filters}
        onFilter={updateFilter}
        onClear={() => clearFilters(id)}
      />

      <FeedbackList
        feedbacks={feedbacks}
        pagination={pagination}
        loading={loading}
        projectId={id}
        onMarkRead={markAsRead}
        onMarkAllRead={markAllAsRead}
        onDelete={deleteFeedback}
        onPageChange={setPage}
      />
    </div>
  );
}
