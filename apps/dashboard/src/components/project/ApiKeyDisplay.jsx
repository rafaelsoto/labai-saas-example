'use client';
import { useState } from 'react';
import { Button } from '../ui/Button';
import styles from './ApiKeyDisplay.module.css';

export function ApiKeyDisplay({ apiKey, onRegenerate }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const displayKey = visible ? apiKey : apiKey?.substring(0, 14) + '••••••••••••••••' + apiKey?.slice(-4);

  const copy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    if (!confirm('Regenerar a API key vai invalidar a key atual. O widget deixará de funcionar até ser atualizado. Continuar?')) return;
    setRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.keyDisplay}>
        <code className={styles.key}>{displayKey}</code>
        <button className={styles.toggle} onClick={() => setVisible(!visible)}>
          {visible ? '🙈' : '👁'}
        </button>
      </div>
      <div className={styles.actions}>
        <Button variant="secondary" size="sm" onClick={copy}>
          {copied ? '✓ Copiado' : 'Copiar'}
        </Button>
        <Button variant="danger" size="sm" onClick={handleRegenerate} loading={regenerating}>
          Regenerar
        </Button>
      </div>
    </div>
  );
}
