import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

/**
 * Lightweight PDF preview component that renders a single page with controls.
 * Mirrors the original inline component UI to avoid layout changes.
 */
export default function PdfPreview({ url, t }) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [renderReady, setRenderReady] = useState(false);
  const canvasRef = useRef(null);
  const previewContainerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    const loadPdf = async () => {
      try {
        if (!mountedRef.current) return;

        setLoading(true);
        setError(null);
        setRenderReady(false);

        // Configure worker for pdfjs
        try {
          if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            try {
              pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
            } catch (e) {
              pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
            }
          }
        } catch (e) {
          // Non-fatal: continue even if worker configuration fails
        }

        const loadingTask = pdfjsLib.getDocument({
          url: url,
          disableAutoFetch: true,
          disableStream: true,
          enableXfa: false,
          ignoreErrors: true,
        });

        const pdf = await loadingTask.promise;

        if (!mountedRef.current) return;

        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        setLoading(false);

        setTimeout(() => {
          if (mountedRef.current) {
            setRenderReady(true);
          }
        }, 100);
      } catch (err) {
        console.error('Error loading PDF:', err);
        if (mountedRef.current) {
          setError(t ? t('pdfLoadFailed') : 'Failed to load PDF');
          setLoading(false);
        }
      }
    };

    loadPdf();
  }, [url]);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !renderReady || !canvasRef.current) return;
      try {
        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport }).promise;
      } catch (err) {
        console.error('Error rendering PDF page:', err);
        if (mountedRef.current) {
          setError(t ? t('pdfRenderFailed') : 'Failed to render PDF page');
          setLoading(false);
        }
      }
    };

    renderPage();
  }, [pdfDoc, currentPage, renderReady]);

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  if (!url) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-surface-alt rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-ink-faint">PDF</span>
        </div>
        <p className="text-ink-muted">{t ? t('noPdfPreview') : 'No PDF available for preview'}</p>
      </div>
    );
  }

  if (loading && !renderReady) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-line border-t-brand"></div>
        </div>
        <p className="text-ink-muted">{t ? t('loadingPdf') : 'Loading PDF...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div ref={previewContainerRef} className="w-full bg-white p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-ink-muted">
          {t ? t('page') : 'Page'} {currentPage} / {totalPages}
        </div>
        <div className="flex gap-2">
          <button onClick={goToPrevPage} className="btn-secondary">{t ? t('prev') : 'Prev'}</button>
          <button onClick={goToNextPage} className="btn-secondary">{t ? t('next') : 'Next'}</button>
        </div>
      </div>
      <div className="border border-line rounded-btn overflow-hidden">
        <canvas ref={canvasRef} className="max-w-full h-auto shadow-lg" style={{ display: 'block' }} />
      </div>
      {loading && (
        <div className="text-center py-2">
          <span className="text-sm text-ink-muted">{t ? t('rendering') : 'Rendering...'}</span>
        </div>
      )}
    </div>
  );
}