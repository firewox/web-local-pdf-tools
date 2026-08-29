import { TOOL_ICONS } from './toolIcons';

// Compact inline header: keeps per-tab context without spending a full card
export default function OperationIntro({ t, activeTab }) {
  const icon = TOOL_ICONS[activeTab];
  if (!icon) return null;

  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="inline-flex items-center justify-center w-10 h-10 shrink-0 rounded-btn bg-brand-soft text-brand">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
          {icon}
        </svg>
      </div>
      <div className="min-w-0">
        <h2 className="text-base sm:text-lg font-semibold text-ink leading-tight" style={{ letterSpacing: 'var(--tracking-display)' }}>
          {t(activeTab)} {activeTab === 'merge' ? 'PDFs' : activeTab === 'convert' ? 'File' : 'PDF'}
        </h2>
        <p className="text-sm text-ink-muted truncate">{t(`${activeTab}Desc`)}</p>
      </div>
    </div>
  );
}
