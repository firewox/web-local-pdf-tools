import PdfPreview from "../pdf/PdfPreview";

export default function DownloadList({ t, downloadLinks, onProcessAgain, onChooseNewFiles }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
        {t('conversionComplete')}
      </h3>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button onClick={onProcessAgain} className="btn-secondary text-lg px-8 py-4 rounded-xl">
          {t('processAgain')}
        </button>
        <button onClick={onChooseNewFiles} className="btn-primary text-lg px-8 py-4 rounded-xl">
          {t('chooseNewFiles')}
        </button>
      </div>

      {downloadLinks.map((link, index) => (
        <div key={index} className="card">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {link.filename}
            {link.page && link.totalPages && link.totalPages > 1 && (
              <span className="text-sm text-muted-600 dark:text-muted-400 ml-2">
                (Page {link.page} of {link.totalPages})
              </span>
            )}
          </h4>

          <div className="flex flex-col md:flex-row gap-6">
            {link.operation === 'convert' && link.url && (
              <div className="flex-1 w-full">
                <div className="border border-muted-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                  {link.filename.match(/\.(jpg|jpeg|png|bmp)$/i) ? (
                    <img
                      src={link.url}
                      alt={link.filename}
                      className="w-full h-auto max-h-96 object-contain"
                      onError={(e) => {
                        console.error('Image preview failed:', link.filename);
                        e.target.style.display = 'none';
                        const fallback = e.target.parentElement.querySelector('.preview-fallback');
                        if (fallback) fallback.style.display = 'block';
                      }}
                    />
                  ) : link.filename.endsWith('.pdf') ? (
                    <div className="w-full min-h-[400px]">
                      <PdfPreview url={link.url} t={t} />
                    </div>
                  ) : null}

                  <div className="preview-fallback hidden p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">📄</span>
                    </div>
                    <p className="text-muted-600 dark:text-muted-400">
                      Preview not available
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 md:w-auto w-full">
              <a
                href={link.url}
                download={link.filename}
                className="btn-success text-lg px-6 py-3 rounded-xl text-center whitespace-nowrap"
              >
                {t('download', { filename: link.filename })}
              </a>

              {(link.filename.match(/\.(jpg|jpeg|png|bmp|pdf)$/i)) && (
                <button
                  onClick={() => window.open(link.url, '_blank')}
                  className="btn-secondary text-lg px-6 py-3 rounded-xl whitespace-nowrap"
                >
                  {t('preview')}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}