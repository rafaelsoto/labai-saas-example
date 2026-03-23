'use client';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import styles from './charts.module.css';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#6366f1'];
const LABELS = ['1★', '2★', '3★', '4★', '5★'];

export function RatingDistribution({ data = [] }) {
  const hasData = data.some((d) => d.count > 0);
  if (!hasData) {
    return <div className={styles.empty}>Sem dados para exibir</div>;
  }

  const pieData = data.map((d, i) => ({
    name: LABELS[i],
    value: d.count,
  }));

  return (
    <div className={styles.chartWrapper}>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {pieData.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8 }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
