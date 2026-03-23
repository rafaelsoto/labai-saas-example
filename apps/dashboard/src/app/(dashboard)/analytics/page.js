'use client';
import { useState, useEffect } from 'react';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { api } from '../../../lib/api';
import { Card } from '../../../components/ui/Card';
import { Select } from '../../../components/ui/Select';
import { Skeleton } from '../../../components/ui/Skeleton';
import { RatingChart } from '../../../components/charts/RatingChart';
import { FeedbacksPerDay } from '../../../components/charts/FeedbacksPerDay';
import { RatingDistribution } from '../../../components/charts/RatingDistribution';
import { TopPages } from '../../../components/charts/TopPages';
import { EmptyState } from '../../../components/common/EmptyState';
import styles from './analytics.module.css';

const periodOptions = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d');
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState([]);
  const [projectOptions, setProjectOptions] = useState([{ value: '', label: 'Todos os projetos' }]);

  const { overview, ratingsOverTime, feedbacksPerDay, topPages, loading } = useAnalytics(
    projectId || null,
    period
  );

  useEffect(() => {
    api.get('/api/projects').then((data) => {
      const ps = data.data || [];
      setProjects(ps);
      setProjectOptions([
        { value: '', label: 'Todos os projetos' },
        ...ps.map((p) => ({ value: p.id, label: p.name })),
      ]);
      if (ps.length > 0 && !projectId) {
        setProjectId(ps[0].id);
      }
    }).catch(console.error);
  }, []);

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Analytics</h1>
        <div className={styles.controls}>
          <Select
            options={projectOptions}
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          />
          <Select
            options={periodOptions}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className={styles.grid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><Skeleton height={220} /></Card>
          ))}
        </div>
      )}

      {!loading && overview && overview.totalFeedbacks === 0 && (
        <EmptyState
          icon="📊"
          title="Sem dados para exibir"
          description="Instale o widget em um projeto e aguarde os primeiros feedbacks."
        />
      )}

      {!loading && overview && overview.totalFeedbacks > 0 && (
        <div className={styles.grid}>
          <Card>
            <h3 className={styles.chartTitle}>Nota Média ao Longo do Tempo</h3>
            <RatingChart data={ratingsOverTime} />
          </Card>

          <Card>
            <h3 className={styles.chartTitle}>Feedbacks por Dia</h3>
            <FeedbacksPerDay data={feedbacksPerDay} />
          </Card>

          <Card>
            <h3 className={styles.chartTitle}>Distribuição de Notas</h3>
            {overview && (
              <RatingDistribution
                data={[1, 2, 3, 4, 5].map((r) => ({ rating: r, count: 0 }))}
              />
            )}
          </Card>

          <Card>
            <h3 className={styles.chartTitle}>Top Páginas</h3>
            <TopPages data={topPages} />
          </Card>
        </div>
      )}
    </div>
  );
}
