export default function ParsedTextPanel({ t, parsedPages, parsedPageItems, currentParsedPage, setCurrentParsedPage, rightTextRef, handleRightSelection, baseFilename }) {
  const handleCopyAll = () => {
    navigator.clipboard.writeText((parsedPages || []).join('\n\n'));
  };

  const handleExportTxt = () => {
    const content = (parsedPages || []).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (baseFilename || 'output.pdf').replace(/\.pdf$/i, '') + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyPage = () => {
    const text = (parsedPages && parsedPages[currentParsedPage - 1]) || '';
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="card space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{t('extractedText')}</h4>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-secondary px-4 py-2 rounded-xl"
            onClick={handleCopyAll}
          >
            {t('copyAll')}
          </button>
          <button
            type="button"
            className="btn-secondary px-4 py-2 rounded-xl"
            onClick={handleExportTxt}
          >
            {t('exportTxt')}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          className="btn-secondary px-4 py-2 rounded-xl"
          onClick={() => setCurrentParsedPage(prev => Math.max(1, prev - 1))}
          disabled={currentParsedPage <= 1}
        >
          {t('prev')}
        </button>
        <span className="text-sm text-muted-600 dark:text-muted-400">
          {t('page')} {currentParsedPage} / {(parsedPages || []).length}
        </span>
        <button
          type="button"
          className="btn-secondary px-4 py-2 rounded-xl"
          onClick={() => setCurrentParsedPage(prev => Math.min((parsedPages || []).length, prev + 1))}
          disabled={currentParsedPage >= (parsedPages || []).length}
        >
          {t('next')}
        </button>
      </div>

      <div
        ref={rightTextRef}
        onMouseUp={handleRightSelection}
        className="bg-muted-50 dark:bg-gray-700 border border-muted-200 dark:border-gray-600 rounded-xl p-4 text-sm whitespace-pre-wrap break-words text-gray-900 dark:text-white"
      >
        {((parsedPageItems && parsedPageItems[currentParsedPage - 1]) || []).length > 0 ? (
          (parsedPageItems[currentParsedPage - 1] || []).map((item, idx) => (
            <span key={idx} data-index={idx}>
              {item.str + ' '}
            </span>
          ))
        ) : (
          <pre className="text-sm whitespace-pre-wrap break-words">{(parsedPages && parsedPages[currentParsedPage - 1]) || ''}</pre>
        )}
      </div>

      <div className="text-center">
        <button
          type="button"
          className="btn-secondary text-lg px-8 py-4 rounded-xl"
          onClick={handleCopyPage}
        >
          {t('copyPage')}
        </button>
      </div>
    </div>
  );
}