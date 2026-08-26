const INTROS = {
  compress: {
    titleKey: 'compress',
    suffix: 'PDF',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
    ),
  },
  merge: {
    titleKey: 'merge',
    suffix: 'PDFs',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4.5v13.5m0-13.5L4.5 8M8 4.5L11.5 8M16 19.5V6m0 13.5L19.5 16M16 19.5L12.5 16" />
    ),
  },
  split: {
    titleKey: 'split',
    suffix: 'PDF',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.75-12H8.25c-.621 0-1.125.504-1.125 1.125v13.5c0 .621.504 1.125 1.125 1.125h7.5c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125z" />
    ),
  },
  parse: {
    titleKey: 'parse',
    suffix: 'PDF',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75h9A1.5 1.5 0 0118 5.25v13.5a1.5 1.5 0 01-1.5 1.5h-9a1.5 1.5 0 01-1.5-1.5V5.25a1.5 1.5 0 011.5-1.5zM9 8.25h6M9 11.25h6M9 14.25h3.5" />
    ),
  },
  convert: {
    titleKey: 'convert',
    suffix: 'File',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    ),
  },
};

export default function OperationIntro({ t, activeTab }) {
  const intro = INTROS[activeTab];
  if (!intro) return null;

  return (
    <div className="card mb-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-btn bg-brand-soft text-brand mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
            {intro.icon}
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-ink mb-2" style={{ letterSpacing: 'var(--tracking-display)' }}>
          {t(intro.titleKey)} {intro.suffix}
        </h2>
        <p className="text-ink-muted">{t(`${intro.titleKey}Desc`)}</p>
      </div>
    </div>
  );
}
