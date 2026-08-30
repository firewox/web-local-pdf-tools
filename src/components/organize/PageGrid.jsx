import { useState } from 'react';
import PageThumb from './PageThumb';

/**
 * Visual page grid for the organize tool: click to select, drag to reorder,
 * hover rotate button, ghosted cells for deleted pages.
 */
export default function PageGrid({
  t,
  pages,
  doc,
  selection,
  onToggle,
  onOpenPreview,
  onRotateOne,
  onToggleDeleted,
  onMove,
  onInsertBlankAfter,
}) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const handleDragStart = (index) => (e) => {
    setDragIndex(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      try {
        e.dataTransfer.setData('text/plain', String(index));
      } catch {
        // some browsers block setData; index is kept in state anyway
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
          const selected = selection.has(page.id);
          const isDragging = dragIndex === index;
          const isOver = overIndex === index && dragIndex !== null && dragIndex !== index;
          return (
            <div
              key={page.id}
              draggable={!page.deleted}
              onDragStart={handleDragStart(index)}
              onDragEnter={handleDragEnter(index)}
              onDragOver={(e) => { if (dragIndex !== null) e.preventDefault(); }}
              onDrop={handleDrop(index)}
              onDragEnd={handleDragEnd}
              onClick={() => onOpenPreview(page.id)}
              className={`group relative flex flex-col gap-1.5 p-2 rounded-btn border cursor-pointer transition-all duration-150 ${
                page.deleted
                  ? 'border-danger/50 opacity-45'
                  : selected
                    ? 'border-brand bg-brand-soft ring-2 ring-brand'
                    : 'border-line bg-surface-alt hover:border-line-strong'
              } ${isDragging ? 'opacity-40' : ''} ${isOver ? 'ring-2 ring-brand' : ''}`}
              title={`${t('page')} ${index + 1}${page.deleted ? ` (${t('deletedPageUndo')})` : ''}`}
            >
              {/* Selection dot: invisible until hover; compact brand dot when selected */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggle(page.id); }}
                className={`absolute top-1 left-1 z-10 w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold leading-none transition-all duration-150 ${
                  selected
                    ? 'bg-brand border-brand text-brand-ink opacity-100'
                    : 'bg-black/35 border-white/80 text-transparent opacity-0 group-hover:opacity-100'
                }`}
                title={selected ? t('deselectPage') : t('selectPage')}
                aria-label={selected ? t('deselectPage') : t('selectPage')}
                aria-pressed={selected}
              >
                ✓
              </button>
              <PageThumb doc={doc} pageNumber={page.page} extraRotation={page.rotation} />

              <div className="flex items-center justify-between px-0.5">
                <span className={`text-xs font-semibold ${page.deleted ? 'text-danger line-through' : 'text-ink-muted'}`}>
                  {index + 1}
                  {page.blank ? ` · ${t('blankPage')}` : ''}
                </span>
                {page.rotation !== 0 && (
                  <span className="text-[10px] font-bold text-brand" title={`+${page.rotation}°`}>
                    ⟳{page.rotation}°
                  </span>
                )}
              </div>

              {/* Hover actions: rotate / insert blank after */}
              {!page.deleted && (
                <div className="absolute top-1 right-1 hidden group-hover:flex flex-col gap-1">
                  {!page.blank && (
                    <button
                      type="button"
                      title={t('organizeRotate')}
                      aria-label={t('organizeRotate')}
                      onClick={(e) => { e.stopPropagation(); onRotateOne(page.id); }}
                      className="w-6 h-6 rounded-full bg-surface border border-line text-ink text-xs leading-none shadow-btn hover:border-brand hover:text-brand"
                    >
                      ⟳
                    </button>
                  )}
                  <button
                    type="button"
                    title={t('organizeInsertBlank')}
                    aria-label={t('organizeInsertBlank')}
                    onClick={(e) => { e.stopPropagation(); onInsertBlankAfter(page.id); }}
                    className="w-6 h-6 rounded-full bg-surface border border-line text-ink text-xs leading-none shadow-btn hover:border-brand hover:text-brand"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-ink-faint text-center mt-3">{t('organizeGridHint')}</p>
    </div>
  );
}
