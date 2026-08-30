/**
 * Sticky action panel for the merge tool (right column).
 * Receives the whole useMerge editor object.
 */
export default function MergePanel({ t, editor, fileMissing }) {
  const { status, applying, totalPages, sources, resetChanges, apply } = editor;
  const ready = status === 'ready' && !fileMissing;
  const hasChanges = editor.pages.some((p) => p.rotation !== 0);

  return (
    <div className="card space-y-4 lg:sticky lg:top-24">
      <div>
        <p className="text-sm font-semibold text-ink">{t('mergeSourcesLabel', { count: sources.length })}</p>
        <p className="text-xs text-ink-faint mt-1">{t('totalPagesCount', { count: totalPages })}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={resetChanges}
          disabled={!ready || (!hasChanges && !editor.pages.some((p, i) => p.key !== sources[i]?.key || p.page !== i + 1))}
          className="btn-secondary text-sm px-3 py-2 col-span-2"
        >
          {t('organizeReset')}
        </button>
      </div>

      <button
        type="button"
        onClick={apply}
        disabled={!ready || applying || totalPages === 0}
        className="btn-primary w-full text-lg px-8 py-4"
      >
        {applying ? t('processing', { count: '' }) : t('mergePdfs')}
      </button>

      {fileMissing && <p className="text-xs text-ink-faint text-center">{t('selectAtLeastTwoFiles')}</p>}
      {ready && totalPages === 0 && (
        <p className="text-xs text-danger text-center">{t('keepAtLeastOnePage')}</p>
      )}
    </div>
  );
}
