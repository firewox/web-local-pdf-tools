import { useState } from 'react';
import { isPdfFile, formatBytes } from '../../utils/pdf';
import PdfThumb from './PdfThumb';

export default function FileSelector({
  t,
  activeTab,
  files,
  changeHandler,
  clearAllFiles,
  removeFile,
  addMoreFiles,
  draggingIndex,
  dragOverIndex,
  handleDragStart,
  handleDragEnter,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  fileReorderEnabled,
  imageReorderMode,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const accept = activeTab === 'convert' ? "application/pdf,image/*,.jpg,.jpeg,.png,.bmp" : "application/pdf";
  const multiple = activeTab === 'merge' || activeTab === 'convert';

  const onDropFiles = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!e.dataTransfer?.files?.length) return;
    changeHandler({ target: { files: e.dataTransfer.files, value: '' } });
  };

  return (
    <div className="space-y-6">
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        name="files"
        onChange={changeHandler}
        id="files"
        className="hidden"
      />
      <label
        htmlFor="files"
        className={`dropzone${isDragOver ? ' is-dragover' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDropFiles}
      >
        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V7.75m0 0l-3.25 3.25M12 7.75l3.25 3.25M4.5 15.75v1.5a3 3 0 003 3h9a3 3 0 003-3v-1.5" />
        </svg>
        <span className="text-base font-semibold">
          {files.length === 0
            ? t('chooseFiles', {
                count: multiple ? 's' : '',
                operation: t(activeTab).toLowerCase(),
              })
            : t('filesSelected', { count: files.length })}
        </span>
        <span className="text-xs text-ink-faint">{t('dropHere')}</span>
      </label>

      {files.length > 0 && (
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <span className="text-sm font-medium text-ink-muted">
              {t('filesSelected', { count: files.length })}
            </span>
            <button
              type="button"
              className="btn-danger text-sm px-4 py-2"
              onClick={clearAllFiles}
              title={t('clearAll')}
            >
              {t('clearAll')}
            </button>
          </div>

          <div className="space-y-3">
            {files.map((file, index) => {
              const reorderEnabled = fileReorderEnabled;
              const isDraggingItem = draggingIndex === index;
              const isDropTarget = dragOverIndex === index && draggingIndex !== null && draggingIndex !== index;
              const baseClasses = "flex items-center justify-between p-4 bg-surface-alt border border-line rounded-btn transition-all duration-150";
              const dragClasses = reorderEnabled ? " cursor-grab active:cursor-grabbing" : "";
              const highlightClasses = [
                isDraggingItem ? "opacity-75 ring-2 ring-brand" : "",
                isDropTarget ? "ring-2 ring-brand bg-brand-soft" : "",
              ].join(' ');

              return (
                <div
                  key={`${file.filename}-${file.lastModified}`}
                  className={`${baseClasses}${dragClasses} ${highlightClasses}`.trim()}
                  draggable={reorderEnabled}
                  onDragStart={handleDragStart(index)}
                  onDragEnter={handleDragEnter(index)}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop(index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    {isPdfFile(file.file) ? (
                      <PdfThumb file={file.file} />
                    ) : (
                      <img
                        src={file.url}
                        alt=""
                        className="w-10 h-14 shrink-0 rounded border border-line object-cover bg-white"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        {reorderEnabled && (
                          <span className="mr-2 text-xs font-semibold text-ink-faint select-none">
                            {index + 1}.
                          </span>
                        )}
                        {file.filename}
                      </p>
                      <p className="text-xs text-ink-faint mt-0.5">
                        {formatBytes(file.size)}
                        {file.pages ? ` · ${t('pages', { count: file.pages })}` : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ml-4 w-6 h-6 shrink-0 bg-danger text-white rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 hover:scale-110 hover:brightness-110"
                    onClick={() => removeFile(index)}
                    title={t('removeFile')}
                    aria-label={t('removeFile')}
                  >
                    ×
                  </button>
                </div>
              );
            })}

            {fileReorderEnabled && (
              <p className="text-xs text-ink-faint text-center">
                {t('dragToReorder')}
              </p>
            )}

            {(activeTab === 'merge' || (activeTab === 'convert' && imageReorderMode)) && (
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-line-strong rounded-btn text-ink-muted hover:border-brand hover:text-brand hover:bg-brand-soft transition-colors"
                onClick={addMoreFiles}
              >
                <span className="text-xl font-bold leading-none">+</span>
                {t('addMoreFiles')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
