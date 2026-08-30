import { useState } from 'react';
import PageThumb from '../organize/PageThumb';
import { SOURCE_COLORS } from '../../hooks/useMerge';

const colorOf = (colorIndex) => SOURCE_COLORS[colorIndex % SOURCE_COLORS.length];

/**
 * Page-level merge grid: all pages of all sources in merge order.
 * Left border + footer dot carry the source color; click opens the
 * large preview; drag reorders at page level; hover rotates.
 */
export default function MergePageGrid({
  t,
  pages,
  docs,
  sources,
  onOpenPreview,
  onRotateOne,
  onMove,
}) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const sourceByKey = Object.fromEntries(sources.map((s) => [s.key, s]));

  const handleDragStart = (index) => (e) => {
    setDragIndex(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      try {
        e.dataTransfer.setData('text/plain', String(index));
      } catch {
        // index is kept in state anyway
      }
    }
  };

  const handleDragEnter = (index) => () => {
    if (dragIndex !== null) setOverIndex(index);
  };

  const handleDrop = (index) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragIndex !== null && dragIndex !== index) onMove(dragIndex, index);
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="card">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {pages.map((page, index) => {
          const source = sourceByKey[page.key];
          const color = colorOf(source?.colorIndex ?? 0);
          return (
            <div
              key={page.id}
              draggable
              onDragStart={handleDragStart(index)}
              onDragEnter={handleDragEnter(index)}
              onDragOver={(e) => { if (dragIndex !== null) e.preventDefault(); }}
              onDrop={handleDrop(index)}
              onDragEnd={handleDragEnd}
              onClick={() => onOpenPreview(page.id)}
              className={`group relative flex flex-col gap-1.5 p-2 pl-2.5 rounded-btn border border-line bg-surface-alt cursor-pointer transition-all duration-150 hover:border-line-strong ${
                dragIndex === index ? 'opacity-40' : ''
              } ${overIndex === index && dragIndex !== null && dragIndex !== index ? 'ring-2 ring-brand' : ''}`}
              style={{ borderLeft: `4px solid ${color.chip}` }}
              title={`${source?.name || ''} · ${t('page')} ${page.page}`}
            >
              <PageThumb doc={docs[page.key]} pageNumber={page.page} extraRotation={page.rotation} />

              <div className="flex items-center justify-between gap-1 px-0.5">
                <span className="flex items-center gap-1 min-w-0 text-xs font-medium text-ink-muted">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: color.chip }}
                    aria-hidden="true"
                  />
                  <span className="truncate">{source?.name || ''}</span>
                </span>
                <span className="text-xs text-ink-faint shrink-0">p{page.page}</span>
              </div>

              {page.rotation !== 0 && (
                <span className="absolute top-1 right-1 text-[10px] font-bold text-brand bg-surface rounded px-1">
                  ⟳{page.rotation}°
                </span>
              )}

              <button
                type="button"
                title={t('organizeRotate')}
                aria-label={t('organizeRotate')}
                onClick={(e) => { e.stopPropagation(); onRotateOne(page.id); }}
                className="absolute top-6 right-1 hidden group-hover:flex w-6 h-6 items-center justify-center rounded-full bg-surface border border-line text-ink text-xs leading-none shadow-btn hover:border-brand hover:text-brand"
              >
                ⟳
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-ink-faint text-center mt-3">{t('mergeGridHint')}</p>
    </div>
  );
}
