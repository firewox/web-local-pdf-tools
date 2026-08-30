import { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { isPdfFile, isPasswordError } from '../utils/pdf';

const ensurePdfWorker = () => {
  try {
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
    }
  } catch {
    // pdfjs resolves the worker on its own if this fails
  }
};

// Fixed accent palette for source documents (readable on light and dark themes)
export const SOURCE_COLORS = [
  { chip: '#2563eb' }, // blue
  { chip: '#16a34a' }, // green
  { chip: '#d97706' }, // amber
  { chip: '#9333ea' }, // purple
  { chip: '#e11d48' }, // rose
  { chip: '#0891b2' }, // cyan
  { chip: '#ca8a04' }, // dark yellow
  { chip: '#db2777' }, // pink
];

const fileKey = (entry) => `${entry.filename}::${entry.lastModified}`;

/**
 * Page-level merge workbench: every page of every selected PDF becomes one
 * card; the grid order IS the merge order. Output is rebuilt losslessly with
 * pdf-lib (no Ghostscript re-encoding).
 */
export function useMerge({ activeTab, files, setState, setDownloadLinks, setErrorMessage, setNotice, t }) {
  const [sources, setSources] = useState([]); // { key, name, size, colorIndex, numPages }
  const [pages, setPages] = useState([]);     // { id, key, page, rotation }
  const [docs, setDocs] = useState({});       // { [sourceKey]: pdfjs document }
  const [status, setStatus] = useState('idle'); // idle | loading | ready
  const [applying, setApplying] = useState(false);
  const [previewId, setPreviewId] = useState(null);
  const idCounter = useRef(0);
  const nextId = () => ++idCounter.current;

  // Reload everything when the set of selected files changes.
  // Keyed on the joined key list so replacing a file with identical
  // name/mtime does not trigger a rebuild.
  const keyList = files.filter(isPdfFile).map(fileKey).join('¦');

  useEffect(() => {
    if (activeTab !== 'merge') {
      setDocs((prev) => { Object.values(prev).forEach((d) => d.destroy?.()); return {}; });
      setSources([]);
      setPages([]);
      setStatus('idle');
      setPreviewId(null);
      return undefined;
    }
    const entries = files.filter(isPdfFile);
    if (!entries.length) {
      setDocs((prev) => { Object.values(prev).forEach((d) => d.destroy?.()); return {}; });
      setSources([]);
      setPages([]);
      setStatus('idle');
      setPreviewId(null);
      return undefined;
    }
    let cancelled = false;
    setStatus('loading');
    setPreviewId(null);
    (async () => {
      const newSources = [];
      const newPages = [];
      const newDocs = {};
      for (const entry of entries) {
        const key = fileKey(entry);
        try {
          ensurePdfWorker();
          const buffer = await entry.file.arrayBuffer();
          const loaded = await pdfjsLib.getDocument({ data: buffer }).promise;
          if (cancelled) {
            loaded.destroy?.();
            return;
          }
          newDocs[key] = loaded;
          newSources.push({
            key,
            name: entry.filename,
            size: entry.size,
            colorIndex: newSources.length,
            numPages: loaded.numPages,
          });
          for (let i = 1; i <= loaded.numPages; i++) {
            newPages.push({ id: nextId(), key, page: i, rotation: 0 });
          }
        } catch (err) {
          if (cancelled) return;
          if (isPasswordError(err)) {
            setNotice?.(t('pdfPasswordProtected'));
          } else {
            console.warn('Failed to load PDF for merge:', err);
          }
          // skip this file; the rest still merge
        }
      }
      if (cancelled) return;
      setDocs((prev) => { Object.values(prev).forEach((d) => d.destroy?.()); return newDocs; });
      setSources(newSources);
      setPages(newPages);
      setStatus(newSources.length ? 'ready' : 'idle');
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, keyList, setNotice, t]);

  const totalPages = pages.length;

  const rotateOne = useCallback((id) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p)));
  }, []);

  const movePage = useCallback((from, to) => {
    setPages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const resetChanges = useCallback(() => {
    let id = 0;
    const next = [];
    for (const s of sources) {
      for (let i = 1; i <= s.numPages; i++) {
        next.push({ id: ++id, key: s.key, page: i, rotation: 0 });
      }
    }
    setPages(next);
    setPreviewId(null);
  }, [sources]);

  const openPreview = useCallback((id) => setPreviewId(id), []);
  const closePreview = useCallback(() => setPreviewId(null), []);
  const stepPreview = useCallback((delta) => {
    setPreviewId((prev) => {
      const index = pages.findIndex((p) => p.id === prev);
      if (index === -1 || !pages.length) return prev;
      return pages[(index + delta + pages.length) % pages.length].id;
    });
  }, [pages]);

  const apply = useCallback(async () => {
    if (!files.length || !pages.length || applying) return;
    setApplying(true);
    try {
      const { PDFDocument, degrees } = await import('pdf-lib');
      // Load each source once with pdf-lib
      const libDocs = {};
      const originalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);
      for (const s of sources) {
        const entry = files.find((f) => fileKey(f) === s.key);
        if (!entry) continue;
        libDocs[s.key] = await PDFDocument.load(await entry.file.arrayBuffer(), { ignoreEncryption: true });
      }
      const out = await PDFDocument.create();
      // Batch consecutive pages from the same source into one copyPages call
      let i = 0;
      while (i < pages.length) {
        const model = pages[i];
        let j = i;
        while (j + 1 < pages.length && pages[j + 1].key === model.key) j++;
        const run = pages.slice(i, j + 1);
        const src = libDocs[model.key];
        const copied = await out.copyPages(src, run.map((p) => p.page - 1));
        run.forEach((modelItem, k) => {
          const page = copied[k];
          const total = (((page.getRotation().angle + modelItem.rotation) % 360) + 360) % 360;
          if (total !== 0) page.setRotation(degrees(total));
          out.addPage(page);
        });
        i = j + 1;
      }
      const bytes = await out.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      setDownloadLinks([{
        url: URL.createObjectURL(blob),
        filename: `merged-${Date.now()}.pdf`,
        operation: 'merge',
        originalSize,
        newSize: blob.size,
      }]);
      setState('toBeDownloaded');
    } catch (err) {
      console.error('Merge failed:', err);
      setState('error');
      setErrorMessage(err?.message || 'Failed to merge PDFs');
    } finally {
      setApplying(false);
    }
  }, [files, pages, sources, applying, setState, setDownloadLinks, setErrorMessage]);

  return {
    sources, pages, docs, status, applying, previewId, totalPages,
    rotateOne, movePage, resetChanges,
    openPreview, closePreview, stepPreview,
    apply,
  };
}
