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
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-2">
            <div
              className="bg-primary-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(current / total) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-muted-600 dark:text-muted-400">
            <span>{t('percentComplete', { percent: Math.round((current / total) * 100) })}</span>
            <span>{t('pagesProgress', { current, total })}</span>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center py-2">
          <div className="animate-pulse text-sm text-muted-600 dark:text-muted-400">
            {t('processingPage', { page: currentPage })}
          </div>
        </div>
      )}
    </>
  );
}