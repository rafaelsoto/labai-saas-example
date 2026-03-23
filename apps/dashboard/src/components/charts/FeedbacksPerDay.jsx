'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { formatDate } from '../../lib/utils';
import styles from './charts.module.css';

export function FeedbacksPerDay({ data = [] }) {
  if (data.length === 0) {
    return <div className={styles.empty}>Sem dados para exibir</div>;
  }

  const formatted = data.map((d) => ({
    ...d,
    date: formatDate(d.date),
    count: parseInt(d.count, 10),
  }));

  return (
    <div className={styles.chartWrapper}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={formatted} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8 }}
            labelStyle={{ color: 'var(--text-secondary)' }}
            itemStyle={{ color: 'var(--accent)' }}
          />
          <Bar dataKey="count" name="Feedbacks" fill="var(--accent)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
