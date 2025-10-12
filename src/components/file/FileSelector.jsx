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
  const accept = activeTab === 'convert' ? "application/pdf,image/*,.jpg,.jpeg,.png,.bmp" : "application/pdf";
  const multiple = activeTab === 'merge' || activeTab === 'convert';

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
      <div className="text-center">
        <label
          htmlFor="files"
          className="btn-primary cursor-pointer text-lg px-8 py-4 rounded-xl"
        >
          {files.length === 0
            ? t('chooseFiles', {
                count: multiple ? 's' : '',
                operation: t(activeTab).toLowerCase(),
              })
            : t('filesSelected', { count: files.length })}
        </label>
      </div>

      {files.length > 0 && (
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <span className="text-sm font-medium text-muted-600 dark:text-muted-400">
              {t('filesSelected', { count: files.length })}
            </span>
            <button
              type="button"
              className="btn-danger text-sm px-4 py-2 rounded-xl"
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
              const baseClasses = "flex items-center justify-between p-4 bg-muted-50 dark:bg-gray-700 border border-muted-200 dark:border-gray-600 rounded-xl transition-all duration-150";
              const dragClasses = reorderEnabled ? " cursor-grab active:cursor-grabbing" : "";
              const highlightClasses = [
                isDraggingItem ? "opacity-75 ring-2 ring-primary-400" : "",
                isDropTarget ? "ring-2 ring-primary-500 bg-primary-50/60 dark:bg-primary-900/20" : "",
              ].join(' ');

              return (
                <div
                  key={index}
                  className={`${baseClasses}${dragClasses} ${highlightClasses}`.trim()}
                  draggable={reorderEnabled}
                  onDragStart={handleDragStart(index)}
                  onDragEnter={handleDragEnter(index)}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop(index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {reorderEnabled && (
                        <span className="mr-2 text-xs font-semibold text-muted-500 dark:text-muted-300 select-none">
                          {index + 1}.
                        </span>
                      )}
                      {file.filename}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="ml-4 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 hover:scale-110"
                    onClick={() => removeFile(index)}
                    title={t('removeFile')}
                  >
                    ×
                  </button>
                </div>
              );
            })}

            {fileReorderEnabled && (
              <p className="text-xs text-muted-600 dark:text-muted-400 text-center">
                {t('dragToReorder')}
              </p>
            )}

            {(activeTab === 'merge' || (activeTab === 'convert' && imageReorderMode)) && (
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-muted-300 dark:border-gray-600 rounded-xl text-muted-600 dark:text-muted-400 hover:border-muted-400 dark:hover:border-gray-500 hover:text-muted-700 dark:hover:text-muted-300 transition-colors"
                onClick={addMoreFiles}
              >
                <span className="text-xl font-bold">+</span>
                {t('addMoreFiles')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}