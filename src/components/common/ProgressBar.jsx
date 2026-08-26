/**
 * Progress bar component for processing status.
 * Props:
 * - progressInfo: { current: number, total: number, currentPage: number }
 * - t: translation function
 */
export default function ProgressBar({ progressInfo, t }) {
  const { current, total, currentPage } = progressInfo || { current: 0, total: 0, currentPage: 0 };

  if (!(total > 0 || currentPage > 0)) return null;

  return (
    <>
      {total > 0 ? (
        <>
          <div className="w-full bg-surface-alt border border-line rounded-full h-3 mb-2 overflow-hidden">
            <div
              className="bg-brand h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(current / total) * 100}%`, boxShadow: 'var(--shadow-glow)' }}
            />
          </div>
          <div className="flex justify-between text-xs text-ink-muted">
            <span>{t('percentComplete', { percent: Math.round((current / total) * 100) })}</span>
            <span>{t('pagesProgress', { current, total })}</span>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center py-2">
          <div className="animate-pulse text-sm text-ink-muted">
            {t('processingPage', { page: currentPage })}
          </div>
        </div>
      )}
    </>
  );
}
