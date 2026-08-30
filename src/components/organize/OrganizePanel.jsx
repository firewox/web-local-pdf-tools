/**
 * Sticky action panel for the organize tool (right column).
 * Receives the whole useOrganize editor object.
 */
export default function OrganizePanel({ t, editor, fileMissing }) {
  const {
    status, applying, keptCount, deleteCount, selectedCount,
    selectAll, invertSelection, rotateSelected, deleteSelected,
    insertBlankAfter, resetChanges, apply, extractSelected,
  } = editor;

  const ready = status === 'ready' && !fileMissing;
  const lastSelectedId = () => {
    const ids = [...editor.selection];
    return ids.length ? ids[ids.length - 1] : null;
  };

  return (
    <div className="card space-y-4 lg:sticky lg:top-24">
      <div>
        <p className="text-sm font-semibold text-ink">
          {t('selectedPagesCount', { selected: selectedCount, total: keptCount })}
        </p>
        {deleteCount > 0 && (
          <p className="text-xs text-danger mt-1">{t('deletedPagesCount', { count: deleteCount })}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={selectAll} disabled={!ready} className="btn-secondary text-sm px-3 py-2">
          {t('selectAll')}
        </button>
        <button type="button" onClick={invertSelection} disabled={!ready} className="btn-secondary text-sm px-3 py-2">
          {t('invertSelection')}
        </button>
        <button
          type="button"
          onClick={rotateSelected}
          disabled={!ready || selectedCount === 0}
          className="btn-secondary text-sm px-3 py-2"
          title={t('organizeRotate')}
        >
          ⟳ {t('organizeRotate')}
        </button>
        <button
          type="button"
          onClick={deleteSelected}
          disabled={!ready || selectedCount === 0}
          className="btn-danger text-sm px-3 py-2"
        >
          {t('organizeDelete')}
        </button>
        <button
          type="button"
          onClick={() => insertBlankAfter(lastSelectedId() ?? editor.pages.length)}
          disabled={!ready}
          className="btn-secondary text-sm px-3 py-2"
        >
          + {t('organizeInsertBlank')}
        </button>
        <button
          type="button"
          onClick={resetChanges}
          disabled={!ready || (deleteCount === 0 && selectedCount === 0 && !editor.pages.some((p) => p.blank || p.rotation !== 0))}
          className="btn-secondary text-sm px-3 py-2"
        >
          {t('organizeReset')}
        </button>
      </div>

      <button
        type="button"
        onClick={extractSelected}
        disabled={!ready || selectedCount === 0 || applying}
        className="btn-secondary w-full text-sm px-4 py-2.5"
      >
        {t('organizeExtract')}
      </button>

      <button
        type="button"
        onClick={apply}
        disabled={!ready || applying || keptCount === 0}
        className="btn-primary w-full text-lg px-8 py-4"
      >
        {applying ? t('processing', { count: '' }) : t('organizeApply')}
      </button>

      {fileMissing && <p className="text-xs text-ink-faint text-center">{t('selectFileFirst')}</p>}
      {ready && keptCount === 0 && (
        <p className="text-xs text-danger text-center">{t('keepAtLeastOnePage')}</p>
      )}
    </div>
  );
}
