'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../../lib/api';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { Card } from '../../../../../components/ui/Card';
import { ApiKeyDisplay } from '../../../../../components/project/ApiKeyDisplay';
import { WidgetPreview } from '../../../../../components/project/WidgetPreview';
import styles from './settings.module.css';

const POSITIONS = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];

export default function ProjectSettingsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', is_active: true, settings: {} });

  useEffect(() => {
    api.get(`/api/projects/${id}`).then((data) => {
      const p = data.project;
      const settings = typeof p.settings === 'string' ? JSON.parse(p.settings) : p.settings || {};
      setProject(p);
      setForm({ name: p.name, url: p.url || '', is_active: p.is_active, settings });
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const setFormField = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const setSetting = (key, value) => setForm((f) => ({ ...f, settings: { ...f.settings, [key]: value } }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await api.put(`/api/projects/${id}`, form);
      setProject(result.project);
      alert('Configurações salvas!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    const result = await api.post(`/api/projects/${id}/regenerate-key`);
    setProject(result.project);
  };

  const deleteProject = async () => {
    if (!confirm('Deletar projeto? Todos os feedbacks serão perdidos.')) return;
    await api.delete(`/api/projects/${id}`);
    router.replace('/projects');
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
  const snippet = project
    ? `<script src="${apiUrl}/api/widget/embed.js"\n  data-api-key="${project.api_key}"\n  defer>\n</script>`
    : '';

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>{project?.name} — Configurações</h1>
        <Button variant="ghost" onClick={() => router.back()}>← Voltar</Button>
      </div>

      <form onSubmit={save}>
        <Card className={styles.section}>
          <h2 className={styles.sectionTitle}>Informações do Projeto</h2>
          <div className={styles.fields}>
            <Input label="Nome" value={form.name} onChange={(e) => setFormField('name', e.target.value)} required />
            <Input label="URL do site" type="url" value={form.url} onChange={(e) => setFormField('url', e.target.value)} />
            <label className={styles.toggle}>
              <input type="checkbox" checked={form.is_active} onChange={(e) => setFormField('is_active', e.target.checked)} />
              <span>Widget ativo</span>
            </label>
          </div>
        </Card>

        <Card className={styles.section}>
          <h2 className={styles.sectionTitle}>Configurações do Widget</h2>
          <div className={styles.widgetConfig}>
            <div className={styles.fields}>
              <div className={styles.colorField}>
                <label className={styles.label}>Cor</label>
                <input
                  type="color"
                  value={form.settings.widget_color || '#6366f1'}
                  onChange={(e) => setSetting('widget_color', e.target.value)}
                  className={styles.colorPicker}
                />
              </div>
              <div>
                <label className={styles.label}>Posição</label>
                <div className={styles.positions}>
                  {POSITIONS.map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      className={`${styles.posBtn} ${form.settings.widget_position === pos ? styles.posActive : ''}`}
                      onClick={() => setSetting('widget_position', pos)}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                label="Texto de prompt"
                value={form.settings.prompt_text || ''}
                onChange={(e) => setSetting('prompt_text', e.target.value)}
                placeholder="Como foi sua experiência?"
              />
              <Input
                label="Texto de agradecimento"
                value={form.settings.thank_you_text || ''}
                onChange={(e) => setSetting('thank_you_text', e.target.value)}
                placeholder="Obrigado pelo seu feedback!"
              />
            </div>
            <WidgetPreview settings={form.settings} />
          </div>
        </Card>

        <Card className={styles.section}>
          <h2 className={styles.sectionTitle}>API Key</h2>
          {project && (
            <ApiKeyDisplay apiKey={project.api_key} onRegenerate={handleRegenerate} />
          )}
        </Card>

        <Card className={styles.section}>
          <h2 className={styles.sectionTitle}>Snippet de Instalação</h2>
          <pre className={styles.snippet}>{snippet}</pre>
          <Button type="button" variant="secondary" size="sm" onClick={() => { navigator.clipboard.writeText(snippet); }}>
            Copiar snippet
          </Button>
        </Card>

        <div className={styles.saveRow}>
          <Button type="submit" loading={saving}>Salvar configurações</Button>
        </div>

        <Card className={styles.dangerZone}>
          <h2 className={styles.dangerTitle}>Zona de Perigo</h2>
          <p className={styles.dangerDesc}>Ao deletar o projeto, todos os feedbacks associados serão removidos permanentemente.</p>
          <Button type="button" variant="danger" onClick={deleteProject}>Deletar projeto</Button>
        </Card>
      </form>
    </div>
  );
}
