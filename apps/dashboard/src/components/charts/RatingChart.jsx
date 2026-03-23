'use client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { formatDate } from '../../lib/utils';
import styles from './charts.module.css';

export function RatingChart({ data = [] }) {
  if (data.length === 0) {
    return <div className={styles.empty}>Sem dados para exibir</div>;
  }

  const formatted = data.map((d) => ({
    ...d,
    date: formatDate(d.date),
    avgRating: parseFloat(d.avgRating) || 0,
  }));

  return (
    <div className={styles.chartWrapper}>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={formatted} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
          <YAxis domain={[0, 5]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8 }}
            labelStyle={{ color: 'var(--text-secondary)' }}
            itemStyle={{ color: 'var(--accent)' }}
          />
          <Line
            type="monotone"
            dataKey="avgRating"
            name="Nota média"
            stroke="var(--accent)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: 'var(--accent)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
