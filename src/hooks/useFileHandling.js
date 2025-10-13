import { useState, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { reorderFiles, isPdfFile, isImageFile } from '../utils/pdf';

const IMAGE_OUTPUT_FORMATS = [
  { value: 'jpg', label: 'JPG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'bmp', label: 'BMP' },
];

const ensurePdfWorker = () => {
  try {
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
    }
  } catch (e) {
    // Ignore worker configuration issues; pdfjs will attempt to resolve automatically.
  }
};

const buildFileRecord = (file, index = 0) => ({
  file,
  filename: file.name || `file-${index + 1}`,
  size: file.size ?? 0,
  type: file.type || '',
  lastModified: file.lastModified ?? Date.now(),
  url: URL.createObjectURL(file),
});

const revokeUrls = (entries = []) => {
  entries.forEach((entry) => {
    if (entry?.url) {
      try {
        window.URL.revokeObjectURL(entry.url);
      } catch {
        // Ignore revoke errors (e.g. already revoked).
      }
    }
  });
};

const readPdfPageCount = async (file) => {
  try {
    ensurePdfWorker();
    const buffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: buffer });
    const doc = await loadingTask.promise;
    const count = doc.numPages ?? 0;
    await loadingTask.destroy?.();
    return count;
  } catch (error) {
    console.warn('Failed to read PDF page count:', error);
    return 0;
  }
};

/**
 * @description 文件处理状态管理
 * @param {object} props
 * @param {Function} props.setState - App 状态更新函数
 * @param {Function} props.setFiles - 文件列表更新函数
 * @param {Function} props.setSupportedFormats - 支持的格式列表更新函数
 * @param {Function} props.setConvertFormat - 转换格式更新函数
 * @param {Function} props.setSelectedPages - 已选页面更新函数
 * @param {Function} props.setPdfPageCount - PDF 页面总数更新函数
 * @returns {object} 包含文件处理相关的状态、引用和函数的对象
 */
export const useFileHandling = ({
  files,
  setFiles,
  activeTab,
  setState,
  setErrorMessage,
  t,
  setSupportedFormats,
  setConvertFormat,
  setSelectedPages,
  setPdfPageCount,
}) => {
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragSourceIndexRef = useRef(null);
  const appendModeRef = useRef(false);

  const resetConversionSelections = useCallback(() => {
    setSupportedFormats?.([]);
    setConvertFormat?.('');
    setSelectedPages?.('');
    setPdfPageCount?.(0);
  }, [setSupportedFormats, setConvertFormat, setSelectedPages, setPdfPageCount]);

  /**
   * @description 处理文件拖动开始事件
   * @param {number} index - 拖动的项目索引
   * @returns {Function} 事件处理函数
   */
  const handleDragStart = (index) => (event) => {
    dragSourceIndexRef.current = index;
    setDraggingIndex(index);
    setDragOverIndex(index);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      try {
        event.dataTransfer.setData('text/plain', String(index));
      } catch (e) {
        // 某些浏览器可能会阻止设置数据；忽略
      }
    }
  };

  /**
   * @description 处理文件拖动进入事件
   * @param {number} index - 拖动进入的项目索引
   * @returns {Function} 事件处理函数
   */
  const handleDragEnter = (index) => (event) => {
    if (dragSourceIndexRef.current === null) return;
    event.preventDefault();
    if (index !== dragOverIndex) {
      setDragOverIndex(index);
    }
  };

  /**
   * @description 处理文件拖动经过事件
   * @param {Event} event - 拖动事件
   */
  const handleDragOver = (event) => {
    if (dragSourceIndexRef.current === null) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  };

  /**
   * @description 处理文件放置事件
   * @param {number} index - 放置的目标索引
   * @returns {Function} 事件处理函数
   */
  const handleDrop = (index) => (event) => {
    if (dragSourceIndexRef.current === null) return;
    event.preventDefault();
    const sourceIndex = dragSourceIndexRef.current;
    if (sourceIndex === index) {
      handleDragEnd();
      return;
    }
    setFiles(prevFiles => reorderFiles(prevFiles, sourceIndex, index));
    handleDragEnd();
  };

  /**
   * @description 处理文件拖动结束事件
   */
  const handleDragEnd = () => {
    dragSourceIndexRef.current = null;
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  /**
   * @description 移除文件
   * @param {number} indexToRemove - 要移除的文件索引
   */
  const removeFile = (indexToRemove) => {
    setFiles(prevFiles => {
      const fileToRemove = prevFiles[indexToRemove];
      if (fileToRemove) {
        window.URL.revokeObjectURL(fileToRemove.url);
      }
      const updatedFiles = prevFiles.filter((_, index) => index !== indexToRemove);
      if (updatedFiles.length === 0) {
        setState('init');
        resetConversionSelections();
        setDraggingIndex(null);
        setDragOverIndex(null);
        dragSourceIndexRef.current = null;
      }
      return updatedFiles;
    });
  };

  /**
   * @description 清除所有文件
   */
  const clearAllFiles = () => {
    setFiles(prevFiles => {
      prevFiles.forEach(file => {
        window.URL.revokeObjectURL(file.url);
      });
      return [];
    });
    setState('init');
    resetConversionSelections();
    setDraggingIndex(null);
    setDragOverIndex(null);
    dragSourceIndexRef.current = null;
  };

  const addMoreFiles = useCallback(() => {
    appendModeRef.current = true;
    const input = document.getElementById('files');
    if (input) {
      input.click();
    }
  }, []);

  const changeHandler = useCallback(async (event) => {
    const inputEl = event.target;
    if (!inputEl) return;

    const pickedFiles = Array.from(inputEl.files || []);
    const existingFiles = files || [];
    const canAppend = appendModeRef.current && (
      (activeTab === 'merge' && existingFiles.length > 0) ||
      (activeTab === 'convert' && existingFiles.length > 0 && existingFiles.every(item => isImageFile(item.file)))
    );
    appendModeRef.current = false;

    if (!pickedFiles.length) {
      inputEl.value = '';
      return;
    }

    let errorMessage = '';
    let nextFiles = [];

    const createRecords = (list) => list.map((file, index) => buildFileRecord(file, index));
    const appendRecords = (records) => (canAppend ? [...existingFiles, ...records] : records);

    if (activeTab === 'convert') {
      const pdfFiles = pickedFiles.filter(isPdfFile);
      const imageFiles = pickedFiles.filter(isImageFile);

      if (pdfFiles.length && imageFiles.length) {
        errorMessage = t('mixedConvertTypesNotSupported');
      } else if (pdfFiles.length) {
        if (pdfFiles.length > 1) {
          errorMessage = t('multiplePdfsNotSupported');
        } else {
          const pdfFile = pdfFiles[0];
          const record = buildFileRecord(pdfFile);
          const pageCount = await readPdfPageCount(pdfFile);
          nextFiles = [record];
          setSupportedFormats?.(IMAGE_OUTPUT_FORMATS);
          setConvertFormat?.((current) => (IMAGE_OUTPUT_FORMATS.some(option => option.value === current) ? current : 'jpg'));
          setSelectedPages?.('');
          setPdfPageCount?.(pageCount);
        }
      } else if (imageFiles.length) {
        if (!canAppend && existingFiles.length && !existingFiles.every(item => isImageFile(item.file))) {
          errorMessage = t('mixedConvertTypesNotSupported');
        } else {
          const records = createRecords(imageFiles);
          nextFiles = appendRecords(records);
          setSupportedFormats?.([{ value: 'pdf', label: 'PDF' }]);
          setConvertFormat?.('pdf');
          setSelectedPages?.('');
          setPdfPageCount?.(0);
        }
      } else {
        errorMessage = t('unsupportedConvertType');
      }
    } else {
      const pdfOnly = pickedFiles.filter(isPdfFile);
      if (pdfOnly.length !== pickedFiles.length) {
        errorMessage = t('unsupportedConvertType');
      } else {
        const limited = activeTab === 'merge' ? pdfOnly : pdfOnly.slice(0, 1);
        const records = createRecords(limited);
        nextFiles = appendRecords(records);
        resetConversionSelections();
      }
    }

    inputEl.value = '';

    if (errorMessage) {
      setErrorMessage(errorMessage);
      setState('error');
      return;
    }

    if (!nextFiles.length) {
      return;
    }

    if (!canAppend) {
      revokeUrls(existingFiles);
    }

    setFiles(nextFiles);
    setErrorMessage('');
    setState('selected');
  }, [files, activeTab, setFiles, setState, setErrorMessage, t, setSupportedFormats, setConvertFormat, setSelectedPages, setPdfPageCount, resetConversionSelections]);

  return {
    draggingIndex,
    dragOverIndex,
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    removeFile,
    clearAllFiles,
    addMoreFiles,
    changeHandler,
  };
};