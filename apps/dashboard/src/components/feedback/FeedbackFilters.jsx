'use client';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import styles from './FeedbackFilters.module.css';

const RATINGS = [1, 2, 3, 4, 5];

export function FeedbackFilters({ projects = [], filters, onFilter, onClear }) {
  const [search, setSearch] = useState(filters.search || '');

  const projectOptions = [
    { value: '', label: 'Todos os projetos' },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      onFilter('search', search);
    }
  };

  const toggleRating = (r) => {
    const current = filters.rating
      ? Array.isArray(filters.rating) ? filters.rating : [filters.rating]
      : [];
    const strR = String(r);
    const next = current.includes(strR)
      ? current.filter((x) => x !== strR)
      : [...current, strR];
    onFilter('rating', next.length > 0 ? next : undefined);
  };

  const activeRatings = filters.rating
    ? Array.isArray(filters.rating) ? filters.rating : [filters.rating]
    : [];

  return (
    <div className={styles.wrapper}>
      <Select
        options={projectOptions}
        value={filters.projectId || ''}
        onChange={(e) => onFilter('projectId', e.target.value || undefined)}
        className={styles.projectSelect}
      />

      <div className={styles.ratingFilter}>
        {RATINGS.map((r) => (
          <button
            key={r}
            onClick={() => toggleRating(r)}
            className={`${styles.ratingBadge} ${activeRatings.includes(String(r)) ? styles.active : ''}`}
          >
            {'★'.repeat(r)}
          </button>
        ))}
      </div>

      <Input
        placeholder="Buscar mensagem... (Enter)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleSearch}
        className={styles.search}
      />

      <Input
        type="date"
        value={filters.startDate || ''}
        onChange={(e) => onFilter('startDate', e.target.value || undefined)}
        className={styles.date}
      />

      <Input
        type="date"
        value={filters.endDate || ''}
        onChange={(e) => onFilter('endDate', e.target.value || undefined)}
        className={styles.date}
      />

      <Button variant="ghost" size="sm" onClick={onClear}>
        Limpar filtros
      </Button>
    </div>
  );
}
