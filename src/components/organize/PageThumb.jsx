import { useEffect, useRef, useState } from 'react';

/**
 * Lazy first-page-render thumbnail for one page of an open pdfjs document.
 * Renders when scrolled into view; re-renders when the extra rotation changes.
 */
export default function PageThumb({ doc, pageNumber, extraRotation = 0 }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !doc || !pageNumber) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const page = await doc.getPage(pageNumber);
        if (cancelled) return;
        const base = page.getViewport({ scale: 1 });
        const rotation = (((page.rotate || 0) + extraRotation) % 360 + 360) % 360;
        const viewport = page.getViewport({ scale: 140 / base.width, rotation });
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      } catch {
        // leave the placeholder frame on render failures
      }
    })();
    return () => { cancelled = true; };
  }, [visible, doc, pageNumber, extraRotation]);

  return (
    <span
      ref={containerRef}
      className="w-full aspect-[3/4] rounded border border-line bg-white overflow-hidden flex items-center justify-center"
    >
      {pageNumber ? (
        <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
      ) : (
        <span className="text-[10px] text-ink-faint border border-dashed border-line-strong rounded px-2 py-1">
          A4
        </span>
      )}
    </span>
  );
}
