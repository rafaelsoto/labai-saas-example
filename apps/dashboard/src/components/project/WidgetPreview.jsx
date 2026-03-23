'use client';
import styles from './WidgetPreview.module.css';

const POSITION_STYLE = {
  'bottom-right': { bottom: 16, right: 16 },
  'bottom-left': { bottom: 16, left: 16 },
  'top-right': { top: 16, right: 16 },
  'top-left': { top: 16, left: 16 },
};

export function WidgetPreview({ settings = {} }) {
  const {
    widget_color = '#6366f1',
    widget_position = 'bottom-right',
    prompt_text = 'Como foi sua experiência?',
  } = settings;

  const posStyle = POSITION_STYLE[widget_position] || POSITION_STYLE['bottom-right'];

  return (
    <div className={styles.preview}>
      <div className={styles.previewScreen}>
        <div className={styles.fakeBrowser}>
          <div className={styles.fakeDots}>
            <span /><span /><span />
          </div>
          <div className={styles.fakeUrl}>meusite.com</div>
        </div>
        <div className={styles.fakeContent}>
          <div className={styles.fakeText} />
          <div className={styles.fakeText} style={{ width: '80%' }} />
          <div className={styles.fakeText} style={{ width: '60%' }} />
        </div>
        <div className={styles.widgetFab} style={{ ...posStyle, backgroundColor: widget_color }}>
          💬
        </div>
      </div>
      <p className={styles.label}>Preview: {prompt_text}</p>
    </div>
  );
}
