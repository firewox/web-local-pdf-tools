import { useEffect, useRef, useState } from 'react';

/**
 * Full-screen preview of a single page at readable size.
 * Arrow keys navigate, Escape closes. Selection / delete actions are
 * optional (organize uses them, merge does not). `getDoc(page)` supplies
 * the pdfjs document that owns the page (single doc for organize, a map
 * lookup for merge).
 */
export default function PagePreviewModal({
  t,
  getDoc,
  pages,
  previewId,
  selection,
  getSourceLabel,
  onClose,
  onNav,
  onRotateOne,
  onInsertBlankAfter,
  onToggleSelect,
  onToggleDeleted,
}) {
  const index = pages.findIndex((p) => p.id === previewId);
  const page = index >= 0 ? pages[index] : null;
  const canvasRef = useRef(null);
  const [rendering, setRendering] = useState(false);
  const selected = page && selection ? selection.has(page.id) : false;

  // Arrow keys navigate, Escape closes
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight') onNav(1);
      else if (e.key === 'ArrowLeft') onNav(-1);
      else if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onNav, onClose]);

  // Suppress the global 1-N tool shortcuts while the modal is open
  useEffect(() => {
    document.body.dataset.previewOpen = '1';
    return () => { delete document.body.dataset.previewOpen; };
  }, []);

  // Render the previewed page large and sharp
  useEffect(() => {
    if (!page || page.blank || !page.page) return undefined;
    const doc = getDoc(page);
    if (!doc) return undefined;
    let cancelled = false;
    setRendering(true);
    (async () => {
      try {
        const pdfPage = await doc.getPage(page.page);
        if (cancelled) return;
        const base = pdfPage.getViewport({ scale: 1 });
        const rotation = (((pdfPage.rotate || 0) + page.rotation) % 360 + 360) % 360;
        const raw = pdfPage.getViewport({ scale: 1, rotation });
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const maxW = Math.min(window.innerWidth - 128, 860);
        const maxH = window.innerHeight - 230;
        const scale = Math.min(maxW / raw.width, maxH / raw.height) * dpr;
        const viewport = pdfPage.getViewport({ scale, rotation });
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
        canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;
        await pdfPage.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      } catch {
        // leave the placeholder on failures
      } finally {
        if (!cancelled) setRendering(false);
      }
    })();
    return () => { cancelled = true; };
  }, [getDoc, page?.id, page?.rotation, page?.page]);

  if (index < 0 || !page) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${t('page')} ${index + 1}`}
    >
      <div
        className="card w-full max-w-4xl max-h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">
              {t('pageOf', { current: index + 1, total: pages.length })}
              {page.deleted ? <span className="text-danger ml-2">{t('deletedPageUndo')}</span> : ''}
            </p>
            <div className="flex items-center gap-2 min-w-0">
              {getSourceLabel && (
                <p className="text-xs text-ink-muted truncate">{getSourceLabel(page)}</p>
              )}
              {page.rotation !== 0 && (
                <p className="text-xs text-brand shrink-0">⟳ +{page.rotation}°</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="chip-btn text-lg leading-none shrink-0"
            aria-label={t('close')}
            title={t('close')}
          >
            ×
          </button>
        </div>

        {/* Page body */}
        <div className="relative flex-1 min-h-[240px] overflow-auto flex items-center justify-center bg-surface-alt rounded-btn border border-line p-3">
          {page.blank ? (
            <div className="text-ink-faint text-sm border border-dashed border-line-strong rounded px-6 py-10">
              {t('blankPage')} · A4
            </div>
          ) : (
            <canvas ref={canvasRef} className="max-w-full shadow-md bg-white" />
          )}
          {rendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-alt/70">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-line border-t-brand" role="status" />
            </div>
          )}
        </div>

        {/* Footer: navigation + page actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onNav(-1)}
              disabled={pages.length < 2}
              className="btn-secondary px-4 py-2 text-sm"
              aria-label={t('prev')}
              title={t('prev')}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => onNav(1)}
              disabled={pages.length < 2}
              className="btn-secondary px-4 py-2 text-sm"
              aria-label={t('next')}
              title={t('next')}
            >
              →
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {onToggleSelect && (
              <button
                type="button"
                onClick={() => onToggleSelect(page.id)}
                disabled={page.deleted}
                className={`text-sm px-3 py-2 rounded-btn border transition-colors ${
                  selected
                    ? 'bg-brand text-brand-ink border-transparent'
                    : 'btn-secondary'
                }`}
              >
                {selected ? t('deselectPage') : t('selectPage')}
              </button>
            )}
            <button
              type="button"
              onClick={() => onRotateOne(page.id)}
              disabled={page.blank}
              className="btn-secondary text-sm px-3 py-2"
            >
              ⟳ {t('organizeRotate')}
            </button>
            {onToggleDeleted && (
              <button
                type="button"
                onClick={() => onToggleDeleted(page.id)}
                disabled={page.blank}
                className={`${page.deleted ? 'btn-secondary' : 'btn-danger'} text-sm px-3 py-2`}
              >
                {page.deleted ? t('restore') : t('organizeDelete')}
              </button>
            )}
            {onInsertBlankAfter && (
              <button
                type="button"
                onClick={() => onInsertBlankAfter(page.id)}
                className="btn-secondary text-sm px-3 py-2"
              >
                + {t('organizeInsertBlank')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
