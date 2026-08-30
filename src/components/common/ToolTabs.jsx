import { useEffect } from 'react';
import { TOOL_ICONS, TOOL_ORDER } from './toolIcons';

/**
 * Tool selector: one large card per tool. Keys 1-N switch tools
 * (ignored while typing in inputs).
 */
export default function ToolTabs({ t, activeTab, setActiveTab, resetForm }) {
  useEffect(() => {
    function onKey(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      // Let modals (e.g. page preview) own the keyboard
      if (document.body.dataset.previewOpen === '1') return;
      const keyNum = parseInt(e.key, 10);
      if (!Number.isInteger(keyNum) || keyNum < 1 || keyNum > TOOL_ORDER.length) return;
      const tab = TOOL_ORDER[keyNum - 1];
      if (tab && tab !== activeTab) {
        setActiveTab(tab);
        resetForm();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeTab, setActiveTab, resetForm]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3" role="tablist" aria-label={t('title')}>
      {TOOL_ORDER.map((id, index) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            title={`${t(id)} — ${index + 1}`}
            onClick={() => {
              if (!active) {
                setActiveTab(id);
                resetForm();
              }
            }}
            className={`group relative flex flex-col items-center gap-2 px-3 py-4 rounded-card border text-center transition-all duration-200 ${
              active
                ? 'border-brand bg-brand-soft'
                : 'border-line bg-surface hover:border-line-strong hover:bg-surface-alt'
            }`}
          >
            <span
              className={`inline-flex items-center justify-center w-11 h-11 rounded-btn transition-colors duration-200 ${
                active ? 'bg-brand text-brand-ink shadow-btn' : 'bg-surface-alt text-ink-muted group-hover:text-brand'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                {TOOL_ICONS[id]}
              </svg>
            </span>
            <span className={`text-sm font-semibold ${active ? 'text-brand' : 'text-ink'}`}>
              {t(id)}
            </span>
            <span className="absolute top-1.5 right-2 text-[10px] font-medium text-ink-faint" aria-hidden="true">
              {index + 1}
            </span>
          </button>
        );
      })}
    </div>
  );
}
