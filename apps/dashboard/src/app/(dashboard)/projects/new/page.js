'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjects } from '../../../../hooks/useProjects';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Card } from '../../../../components/ui/Card';
import { Modal } from '../../../../components/ui/Modal';
import styles from './new-project.module.css';

export default function NewProjectPage() {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdProject, setCreatedProject] = useState(null);
  const [copied, setCopied] = useState(false);
  const { createProject } = useProjects();
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError('Nome é obrigatório'); return; }
    setError('');
    setLoading(true);
    try {
      const project = await createProject({ name: name.trim(), url: url.trim() || null });
      setCreatedProject(project);
    } catch (err) {
      setError(err.message || 'Erro ao criar projeto');
    } finally {
      setLoading(false);
    }
  }

  const snippet = createdProject
    ? `<script src="http://localhost:3333/api/widget/embed.js"\n  data-api-key="${createdProject.api_key}"\n  defer>\n</script>`
    : '';

  const copySnippet = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Novo Projeto</h1>

      <Card className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            id="name"
            label="Nome do projeto"
            placeholder="Ex: Meu E-commerce"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            id="url"
            label="URL do site (opcional)"
            placeholder="https://meusite.com.br"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.buttons}>
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" loading={loading}>Criar projeto</Button>
          </div>
        </form>
      </Card>

      <Modal isOpen={!!createdProject} onClose={() => router.replace('/projects')} title="🎉 Projeto criado!">
        <div className={styles.modal}>
          <p className={styles.modalText}>Copie o snippet abaixo e cole antes do <code>&lt;/body&gt;</code> do seu site:</p>
          <pre className={styles.snippet}>{snippet}</pre>
          <Button onClick={copySnippet} className={styles.copyBtn}>
            {copied ? '✓ Copiado!' : 'Copiar snippet'}
          </Button>
          <Button variant="secondary" onClick={() => router.replace('/projects')} className={styles.doneBtn}>
            Ir para Projetos
          </Button>
        </div>
      </Modal>
    </div>
  );
}
