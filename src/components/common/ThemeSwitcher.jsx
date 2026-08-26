import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UI_THEMES } from '../../hooks/useTheme';

/* Miniature style previews: [page bg, card bg, accent, border] per theme */
const PREVIEWS = {
  bento: { bg: '#f4f6fb', card: '#ffffff', accent: '#2563eb', border: '#e2e8f0', dark: false },
  aurora: { bg: 'linear-gradient(135deg,#c4b5fd,#67e8f9)', card: 'rgba(255,255,255,.75)', accent: '#7c3aed', border: 'rgba(99,102,241,.4)', dark: false },
  swiss: { bg: '#ffffff', card: '#ffffff', accent: '#e30613', border: '#111111', dark: false },
  brutalism: { bg: '#f9f4e8', card: '#fffdf5', accent: '#ffd803', border: '#111111', dark: false },
  terminal: { bg: '#050807', card: '#0a120c', accent: '#4ade80', border: '#1e3325', dark: true },
};

function ThemePreview({ id }) {
  const p = PREVIEWS[id] || PREVIEWS.bento;
  return (
    <span
      className="relative inline-flex w-9 h-7 rounded-md overflow-hidden shrink-0 border"
      style={{ background: p.bg, borderColor: p.border }}
      aria-hidden="true"
    >
      <span
        className="absolute left-1 top-1 w-3.5 h-2.5 rounded-[3px] border"
        style={{ background: p.card, borderColor: p.border }}
      />
      <span
        className="absolute right-1 bottom-1 w-3.5 h-1.5 rounded-[2px]"
        style={{ background: p.accent }}
      />
    </span>
  );
}

export default function ThemeSwitcher({ uiTheme, setUiTheme }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="chip-btn"
        onClick={() => setOpen((v) => !v)}
        title={t('uiTheme')}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 100 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.6-.38-.99 0-.83.67-1.5 1.5-1.5H16a5 5 0 005-5c0-4.42-4.03-8-9-8z" />
          <circle cx="7.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="10.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="8.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('uiTheme')}
          className="absolute right-0 mt-2 w-64 p-2 z-50 border animate-fade-up"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--line)',
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--shadow-pop)',
            backdropFilter: 'var(--card-blur)',
          }}
        >
          {UI_THEMES.map((theme) => {
            const active = theme.id === uiTheme;
            return (
              <button
                key={theme.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setUiTheme(theme.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-2.5 py-2 text-left rounded-btn transition-colors duration-150 ${
                  active
                    ? 'bg-brand-soft text-brand'
                    : 'text-ink hover:bg-surface-alt'
                }`}
              >
                <ThemePreview id={theme.id} />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold leading-tight">{theme.label}</span>
                  <span className="block text-xs text-ink-muted truncate">{t(theme.descKey)}</span>
                </span>
                {active && (
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
