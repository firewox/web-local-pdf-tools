import PdfPreview from "../pdf/PdfPreview";
import { formatBytes } from "../../utils/pdf";

/**
 * Build the size feedback line for a download entry.
 * Compress/merge show a before -> after comparison; other operations show the
 * output size only.
 */
function sizeSummary(t, link) {
  const originalSize = link.originalSize || 0;
  const newSize = link.newSize || 0;
  if (newSize > 0 && originalSize > 0 && (link.operation === 'compress' || link.operation === 'merge')) {
    const percent = Math.round((1 - newSize / originalSize) * 100);
    if (percent > 0) {
      return t('sizeSmaller', { before: formatBytes(originalSize), after: formatBytes(newSize), percent });
    }
    if (percent < 0) {
      return t('sizeLarger', { before: formatBytes(originalSize), after: formatBytes(newSize), percent: Math.abs(percent) });
    }
  }
  if (newSize > 0) {
    return t('outputSize', { size: formatBytes(newSize) });
  }
  return null;
}

export default function DownloadList({ t, downloadLinks, onProcessAgain, onChooseNewFiles }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-ink text-center">
        {t('conversionComplete')}
      </h3>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button onClick={onProcessAgain} className="btn-secondary text-lg px-8 py-4">
          {t('processAgain')}
        </button>
        <button onClick={onChooseNewFiles} className="btn-primary text-lg px-8 py-4">
          {t('chooseNewFiles')}
        </button>
      </div>

      {downloadLinks.map((link, index) => (
        <div key={index} className="card">
          <h4 className="text-lg font-semibold text-ink mb-1">
            {link.filename}
            {link.page && link.totalPages && link.totalPages > 1 && (
              <span className="text-sm text-ink-muted ml-2">
                (Page {link.page} of {link.totalPages})
              </span>
            )}
          </h4>

          {sizeSummary(t, link) && (
            <p className="text-sm text-brand font-medium mb-4">{sizeSummary(t, link)}</p>
          )}

          <div className="flex flex-col md:flex-row gap-6">
            {link.operation === 'convert' && link.url && (
              <div className="flex-1 w-full">
                <div className="border border-line rounded-btn overflow-hidden bg-white">
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
                    <div className="w-16 h-16 mx-auto mb-4 bg-surface-alt rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-ink-muted">📄</span>
                    </div>
                    <p className="text-ink-muted">
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
                className="btn-success text-lg px-6 py-3 text-center whitespace-nowrap"
              >
                {t('download', { filename: link.filename })}
              </a>

              {(link.filename.match(/\.(jpg|jpeg|png|bmp|pdf)$/i)) && (
                <button
                  onClick={() => window.open(link.url, '_blank')}
                  className="btn-secondary text-lg px-6 py-3 whitespace-nowrap"
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