import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

/**
 * Tiny first-page thumbnail for a PDF file. Renders once per file instance;
 * failures (e.g. encrypted files) leave an empty frame with a PDF label.
 */
export default function PdfThumb({ file }) {
  const canvasRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
        }
        const buffer = await file.arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
        const page = await doc.getPage(1);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: 40 / base.width });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        await doc.destroy?.();
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => { cancelled = true; };
  }, [file]);

  return (
    <span className="relative w-10 h-14 shrink-0 rounded border border-line bg-white overflow-hidden flex items-center justify-center">
      {(!failed) && <canvas ref={canvasRef} className="w-full h-full object-cover" />}
      {failed && <span className="text-[9px] font-bold text-ink-faint">PDF</span>}
    </span>
  );
}
