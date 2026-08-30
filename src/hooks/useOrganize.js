import { useState, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { isPdfFile, isPasswordError, reorderFiles } from '../utils/pdf';

const ensurePdfWorker = () => {
  try {
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
    }
  } catch {
    // pdfjs resolves the worker on its own if this fails
  }
};

const A4 = [595.28, 841.89];

/**
 * Page workbench state machine for the organize tool.
 * Pages are an ordered list of { id, page, rotation, deleted, blank };
 * every edit is pure front-end state - pdf-lib only runs on apply/extract.
 */
export function useOrganize({ activeTab, files, setState, setDownloadLinks, setErrorMessage, setNotice, t }) {
  const [pages, setPages] = useState([]);
  const [selection, setSelection] = useState(() => new Set());
  const [doc, setDoc] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | ready
  const [applying, setApplying] = useState(false);
  const [previewId, setPreviewId] = useState(null);

  // Load the pdfjs document for the organize tab; clear when leaving or empty
  useEffect(() => {
    let cancelled = false;
    const entry = files[0];
    if (activeTab !== 'organize' || !entry || !isPdfFile(entry.file)) {
      doc?.destroy?.();
      setDoc(null);
      setPages([]);
      setSelection(new Set());
      setStatus('idle');
      return undefined;
    }
    setStatus('loading');
    (async () => {
      try {
        ensurePdfWorker();
        const buffer = await entry.file.arrayBuffer();
        const loaded = await pdfjsLib.getDocument({ data: buffer }).promise;
        if (cancelled) {
          loaded.destroy?.();
          return;
        }
        setDoc(loaded);
        setPages(Array.from({ length: loaded.numPages }, (_, i) => ({
          id: i + 1,
          page: i + 1,
          rotation: 0,
          deleted: false,
          blank: false,
        })));
        setSelection(new Set());
        setStatus('ready');
      } catch (err) {
        if (!cancelled) {
          setStatus('idle');
          if (isPasswordError(err)) {
            setNotice?.(t('pdfPasswordProtected'));
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, files, setNotice, t]);

  // Destroy the pdfjs document on unmount
  useEffect(() => () => {
    doc?.destroy?.();
  }, [doc]);

  const keptPages = pages.filter((p) => !p.deleted);
  const keptCount = keptPages.length;
  const deleteCount = pages.length - keptCount;
  const selectedIds = [...selection].filter((id) => {
    const p = pages.find((entry) => entry.id === id);
    return p && !p.deleted;
  });
  const selectedCount = selectedIds.length;

  const toggleSelect = useCallback((id) => {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelection(new Set(pages.filter((p) => !p.deleted).map((p) => p.id)));
  }, [pages]);

  const invertSelection = useCallback(() => {
    setSelection((prev) => new Set(pages.filter((p) => !p.deleted && !prev.has(p.id)).map((p) => p.id)));
  }, [pages]);

  const rotateSelected = useCallback(() => {
    setPages((prev) => prev.map((p) => (selection.has(p.id) && !p.deleted && !p.blank
      ? { ...p, rotation: (p.rotation + 90) % 360 }
      : p)));
  }, [selection]);

  const rotateOne = useCallback((id) => {
    setPages((prev) => prev.map((p) => (p.id === id && !p.blank
      ? { ...p, rotation: (p.rotation + 90) % 360 }
      : p)));
  }, []);

  const deleteSelected = useCallback(() => {
    setPages((prev) => prev.map((p) => (selection.has(p.id) ? { ...p, deleted: true } : p)));
    setSelection(new Set());
  }, [selection]);

  const toggleDeleted = useCallback((id) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, deleted: !p.deleted } : p)));
  }, []);

  const insertBlankAfter = useCallback((id) => {
    setPages((prev) => {
      const index = prev.findIndex((p) => p.id === id);
      const insertAt = index === -1 ? prev.length : index + 1;
      const nextId = Math.max(...prev.map((p) => p.id), 0) + 1;
      const next = [...prev];
      next.splice(insertAt, 0, { id: nextId, page: null, rotation: 0, deleted: false, blank: true });
      return next;
    });
  }, []);

  const movePage = useCallback((from, to) => {
    setPages((prev) => reorderFiles(prev, from, to));
  }, []);

  // Large-preview navigation (wraps around)
  const openPreview = useCallback((id) => setPreviewId(id), []);
  const closePreview = useCallback(() => setPreviewId(null), []);
  const stepPreview = useCallback((delta) => {
    setPreviewId((prev) => {
      const index = pages.findIndex((p) => p.id === prev);
      if (index === -1 || pages.length === 0) return prev;
      return pages[(index + delta + pages.length) % pages.length].id;
    });
  }, [pages]);

  const resetChanges = useCallback(() => {
    setPages((prev) => prev
      .filter((p) => !p.blank)
      .map((p, i) => ({ ...p, rotation: 0, deleted: false, page: i + 1 })));
    setSelection(new Set());
  }, []);

  const baseName = () => (files[0]?.filename || 'output.pdf').replace(/\.pdf$/i, '');

  const buildOutput = useCallback(async (pageModels, filename) => {
    const { PDFDocument, degrees } = await import('pdf-lib');
    const sourceBuffer = await files[0].file.arrayBuffer();
    const src = await PDFDocument.load(sourceBuffer, { ignoreEncryption: true });
    const out = await PDFDocument.create();
    const realPages = pageModels.filter((p) => !p.blank);
    const copied = await out.copyPages(src, realPages.map((p) => p.page - 1));
    let copiedIndex = 0;
    for (const model of pageModels) {
      if (model.blank) {
        out.addPage(A4);
        continue;
      }
      const page = copied[copiedIndex++];
      const total = (((page.getRotation().angle + model.rotation) % 360) + 360) % 360;
      if (total !== 0) page.setRotation(degrees(total));
      out.addPage(page);
    }
    const bytes = await out.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    return {
      url: URL.createObjectURL(blob),
      filename,
      operation: 'organize',
      originalSize: files[0]?.size || 0,
      newSize: blob.size,
    };
  }, [files]);

  const finishWith = useCallback((link) => {
    setDownloadLinks([link]);
    setState('toBeDownloaded');
  }, [setDownloadLinks, setState]);

  const apply = useCallback(async () => {
    const kept = pages.filter((p) => !p.deleted);
    if (!files.length || !kept.length || applying) return;
    setApplying(true);
    try {
      const link = await buildOutput(kept, `${baseName()}-organized.pdf`);
      finishWith(link);
    } catch (err) {
      console.error('Organize failed:', err);
      setState('error');
      setErrorMessage(err?.message || 'Failed to organize pages');
    } finally {
      setApplying(false);
    }
  }, [pages, files, applying, buildOutput, baseName, finishWith, setState, setErrorMessage]);

  const extractSelected = useCallback(async () => {
    const models = pages.filter((p) => !p.deleted && !p.blank && selection.has(p.id));
    if (!files.length || !models.length || applying) return;
    setApplying(true);
    try {
      const link = await buildOutput(models, `${baseName()}-extracted.pdf`);
      finishWith(link);
    } catch (err) {
      console.error('Extract failed:', err);
      setState('error');
      setErrorMessage(err?.message || 'Failed to extract pages');
    } finally {
      setApplying(false);
    }
  }, [pages, selection, files, applying, buildOutput, baseName, finishWith, setState, setErrorMessage]);

  return {
    pages, selection, doc, status, applying, previewId,
    keptCount, deleteCount, selectedCount,
    toggleSelect, selectAll, invertSelection,
    rotateSelected, rotateOne, toggleDeleted, deleteSelected,
    insertBlankAfter, movePage, resetChanges,
    openPreview, closePreview, stepPreview,
    apply, extractSelected,
  };
}
