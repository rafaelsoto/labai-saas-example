'use client';
import Link from 'next/link';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import styles from './ProjectCard.module.css';

export function ProjectCard({ project }) {
  const settings = typeof project.settings === 'string'
    ? JSON.parse(project.settings)
    : project.settings || {};

  const maskedKey = project.api_key
    ? project.api_key.substring(0, 14) + '...' + project.api_key.slice(-4)
    : '';

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div className={styles.colorDot} style={{ backgroundColor: settings.widget_color || '#6366f1' }} />
        <h3 className={styles.name}>{project.name}</h3>
        <Badge variant={project.is_active ? 'success' : 'default'}>
          {project.is_active ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>

      {project.url && (
        <p className={styles.url}>{project.url.replace(/^https?:\/\//, '')}</p>
      )}

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{project.feedback_count || 0}</span>
          <span className={styles.statLabel}>Feedbacks</span>
        </div>
      </div>

      <p className={styles.apiKey}>{maskedKey}</p>

      <div className={styles.actions}>
        <Link href={`/projects/${project.id}`} className={styles.link}>
          Ver feedbacks →
        </Link>
        <Link href={`/projects/${project.id}/settings`} className={styles.settingsLink}>
          ⚙ Configurar
        </Link>
      </div>
    </Card>
  );
}
