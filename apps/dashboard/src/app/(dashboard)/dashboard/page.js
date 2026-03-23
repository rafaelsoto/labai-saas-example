'use client';
import { useState } from 'react';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { Card } from '../../../components/ui/Card';
import { Select } from '../../../components/ui/Select';
import { Skeleton } from '../../../components/ui/Skeleton';
import { RatingChart } from '../../../components/charts/RatingChart';
import { FeedbacksPerDay } from '../../../components/charts/FeedbacksPerDay';
import { RatingDistribution } from '../../../components/charts/RatingDistribution';
import { TopPages } from '../../../components/charts/TopPages';
import { formatNumber } from '../../../lib/utils';
import styles from './dashboard.module.css';

const periodOptions = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
];

function KpiCard({ label, value, trend, loading }) {
  if (loading) return <Card><Skeleton height={80} /></Card>;

  const trendPositive = trend >= 0;

  return (
    <Card className={styles.kpiCard}>
      <p className={styles.kpiLabel}>{label}</p>
      <p className={styles.kpiValue}>{value}</p>
      {trend !== undefined && (
        <p className={`${styles.kpiTrend} ${trendPositive ? styles.trendUp : styles.trendDown}`}>
          {trendPositive ? '↑' : '↓'} {Math.abs(trend)}% vs período anterior
        </p>
      )}
    </Card>
  );
}

export default function DashboardPage() {
  const [period, setPeriod] = useState('30d');
  const { overview, ratingsOverTime, feedbacksPerDay, loading } = useAnalytics(null, period);

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <Select
          options={periodOptions}
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        />
      </div>

      <div className={styles.kpiGrid}>
        <KpiCard
          label="Total de Feedbacks"
          value={formatNumber(overview?.totalFeedbacks)}
          trend={overview?.trend}
          loading={loading}
        />
        <KpiCard
          label="Nota Média"
          value={overview?.avgRating ? `★ ${overview.avgRating.toFixed(1)}` : '—'}
          loading={loading}
        />
        <KpiCard
          label="Total de Projetos"
          value={formatNumber(overview?.totalProjects)}
          loading={loading}
        />
        <KpiCard
          label="Tendência"
          value={overview?.trend !== undefined ? `${overview.trend > 0 ? '+' : ''}${overview.trend}%` : '—'}
          loading={loading}
        />
      </div>

      <div className={styles.chartsGrid}>
        <Card>
          <h3 className={styles.chartTitle}>Nota Média ao Longo do Tempo</h3>
          {loading ? <Skeleton height={200} /> : <RatingChart data={ratingsOverTime} />}
        </Card>
        <Card>
          <h3 className={styles.chartTitle}>Feedbacks por Dia</h3>
          {loading ? <Skeleton height={200} /> : <FeedbacksPerDay data={feedbacksPerDay} />}
        </Card>
      </div>

      {!loading && overview && overview.totalFeedbacks === 0 && (
        <Card className={styles.emptyState}>
          <p className={styles.emptyIcon}>📭</p>
          <h3>Sem dados ainda</h3>
          <p>Crie um projeto e instale o widget para começar a coletar feedbacks.</p>
        </Card>
      )}
    </div>
  );
}
