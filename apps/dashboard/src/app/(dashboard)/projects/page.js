'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useProjects } from '../../../hooks/useProjects';
import { ProjectCard } from '../../../components/project/ProjectCard';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/common/EmptyState';
import styles from './projects.module.css';

export default function ProjectsPage() {
  const { projects, loading } = useProjects();

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Projetos</h1>
        <Link href="/projects/new">
          <Button variant="primary">+ Novo Projeto</Button>
        </Link>
      </div>

      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={200} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon="⬡"
          title="Nenhum projeto ainda"
          description="Crie seu primeiro projeto para começar a coletar feedbacks."
          action={
            <Link href="/projects/new">
              <Button variant="primary">Criar projeto</Button>
            </Link>
          }
        />
      ) : (
        <div className={styles.grid}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
