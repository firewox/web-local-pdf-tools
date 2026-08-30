import { useCallback } from 'react';
import { processWithGS } from '../services/pdfService.js';
import { createPdfWithMultipleImages } from '../services/imagePdf.js';
import * as pdfjsLib from 'pdfjs-dist';
import { parsePageSelection, joinPdfTextItems, isPasswordError, findInvalidPageTokens } from '../utils/pdf.js';
import { encodeBmp } from '../utils/bmp.js';

/**
 * @description 将 Worker 返回的结果地址规范为可下载的 blob URL
 * @param {string} response - blob URL 或其他 URL 形式（如 data URL）
 * @returns {Promise<string>} blob URL
 */
async function loadPDFData(response) {
  if (typeof response === 'string' && response.startsWith('blob:')) {
    return response;
  }
  const res = await fetch(response);
  const buffer = await res.arrayBuffer();
  const blob = new Blob([buffer], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

/**
 * @description PDF 操作
 * @param {object} props - 属性
 * @returns {object} 包含 PDF 操作函数的对象
 */
export const usePdfOperations = ({
  files,
  setFiles,
  activeTab,
  customCommand,
  setCustomCommand,
  useCustomCommand,
  setUseCustomCommand,
  pdfSetting,
  splitRange,
  advancedSettings,
  useAdvancedSettings,
  setUseAdvancedSettings,
  convertFormat,
  setConvertFormat,
  setSupportedFormats,
  selectedPages,
  setSelectedPages,
  pdfPageCount,
  repairMode,
  setRepairMode,
  organizeApply,
  showTerminalOutput,
  showProgressBar,
  setState,
  setTerminalData,
  setProgressInfo,
  setDownloadLinks,
  setErrorMessage,
  setNotice,
  setParsedPages,
  setParsedPageItems,
  setCurrentParsedPage,
  setPdfPageCount,
  pdfDocRef,
  t,
}) => {

  /**
   * @description 从输出中解析进度
   * @param {string} output - 终端输出
   */
  const parseProgressFromOutput = (output) => {
    const totalPagesMatch = output.match(/Processing pages \d+ through (\d+)/);
    if (totalPagesMatch) {
      const totalPages = parseInt(totalPagesMatch[1]);
      setProgressInfo(prev => ({ ...prev, total: totalPages }));
    }

    const currentPageMatch = output.match(/^Page (\d+)$/);
    if (currentPageMatch) {
      const currentPage = parseInt(currentPageMatch[1]);
      setProgressInfo(prev => ({
        ...prev,
        currentPage: currentPage,
        current: currentPage
      }));
    }
  };


  /**
   * @description 处理 PDF
   * @param {string} operation - 操作类型
   * @param {Array<File>} inputFiles - 输入文件
   * @param {string} filename - 文件名
   */
  async function processPDF(operation, inputFiles, filename) {
    setDownloadLinks([]);
    setState('loading');
    setTerminalData('');
    setProgressInfo({ current: 0, total: 0, currentPage: 0 });
    const originalSize = (inputFiles || []).reduce((sum, entry) => sum + (entry?.size || 0), 0);

    try {
      let dataObject = {
        operation,
        // 'original' (merge) means no -dPDFSETTINGS: combine files without re-compressing.
        // Repair mode also skips presets: pdfwrite rewrites the file structure only.
        pdfSetting: (useCustomCommand || pdfSetting === 'original' || repairMode) ? null : pdfSetting,
        customCommand: useCustomCommand ? customCommand : null,
        advancedSettings: useAdvancedSettings ? advancedSettings : null,
        showTerminalOutput: showTerminalOutput,
        showProgressBar: showProgressBar,
        convertFormat: activeTab === 'convert' ? convertFormat : null
      };

      if (operation === 'merge') {
        dataObject.files = inputFiles.map(file => file.url);
      } else if (operation === 'split') {
        dataObject.psDataURL = inputFiles[0].url;
        dataObject.splitRange = splitRange;
      } else {
        dataObject.psDataURL = inputFiles[0].url;
      }

      const result = await processWithGS(
        dataObject,
        (showTerminalOutput || showProgressBar) ? (outputText) => {
          if (showTerminalOutput) {
            setTerminalData(prev => prev + outputText + '\n');
          }
          if (showProgressBar) {
            parseProgressFromOutput(outputText);
          }
        } : null
      );

      if (result.error) {
        console.error('Processing failed:', result.error);
        setState('error');
        setErrorMessage(isPasswordError(result.error) ? t('pdfPasswordProtected') : result.error);
        setTerminalData('');
        setProgressInfo({ current: 0, total: 0, currentPage: 0 });
        return;
      }

      let pdfURL;
      let newSize = 0;
      if (result.pdfArrayBuffer) {
        const blob = new Blob([result.pdfArrayBuffer], { type: 'application/pdf' });
        pdfURL = URL.createObjectURL(blob);
        newSize = blob.size;
      } else {
        pdfURL = await loadPDFData(result.pdfDataURL);
      }

      setDownloadLinks([{
        url: pdfURL,
        filename: getOutputFilename(filename, operation),
        operation,
        originalSize,
        newSize
      }]);
      setState('toBeDownloaded');
      setTerminalData('');
      setProgressInfo({ current: 0, total: 0, currentPage: 0 });

    } catch (error) {
      console.error('Processing failed:', error);
      setState('error');
      setErrorMessage(isPasswordError(error) ? t('pdfPasswordProtected') : (error.message || 'An unexpected error occurred during processing'));
      setTerminalData('');
      setProgressInfo({ current: 0, total: 0, currentPage: 0 });
    }
  }

  /**
   * @description 转换文件
   * @param {Array<File>} inputFiles - 输入文件
   * @param {string} filename - 文件名
   */
  async function convertFile(inputFiles, filename) {
    setDownloadLinks([]);
    setState('loading');
    setTerminalData('');
    setProgressInfo({ current: 0, total: 0, currentPage: 0 });

    try {
      const file = inputFiles[0].file;
      const fileType = file.type;

      if (file.type.startsWith('application/pdf') && ['jpg', 'jpeg', 'png', 'bmp'].includes(convertFormat)) {
        try {
          pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
        } catch (e) {}

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        
        const pagesToConvert = parsePageSelection(selectedPages, numPages);
        if (pagesToConvert.length === 0) {
          throw new Error(t('invalidPageSelection'));
        }
        setProgressInfo({ current: 0, total: pagesToConvert.length, currentPage: 0 });

        const downloadLinks = [];
        
        for (const [index, pageNum] of pagesToConvert.entries()) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2.0 });
          
          const canvas = document.createElement('canvas');
          if (!canvas || typeof canvas.getContext !== 'function') {
            throw new Error('Canvas is not properly initialized');
          }
          const context = canvas.getContext('2d');
          if (!context) {
            throw new Error('Failed to get 2D context from canvas');
          }
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          
          await page.render(renderContext).promise;

          // Canvas cannot encode BMP natively, so BMP goes through our own encoder
          let blob;
          if (convertFormat === 'bmp') {
            blob = new Blob([encodeBmp(context.getImageData(0, 0, canvas.width, canvas.height))], { type: 'image/bmp' });
          } else {
            const imageUrl = canvas.toDataURL(`image/${convertFormat === 'jpg' ? 'jpeg' : convertFormat}`);
            blob = await (await fetch(imageUrl)).blob();
          }
          const url = window.URL.createObjectURL(blob);
          
          const baseName = filename.replace(/\.pdf$/i, '');
          const pageFilename = numPages > 1 ? 
            `${baseName}-page-${pageNum}.${convertFormat}` : 
            `${baseName}.${convertFormat}`;
          
          downloadLinks.push({
            url: url,
            filename: pageFilename,
            operation: 'convert',
            page: pageNum,
            totalPages: numPages,
            originalSize: file.size || 0,
            newSize: blob.size
          });
          
          setProgressInfo({ current: index + 1, total: pagesToConvert.length, currentPage: pageNum });
        }
        
        setDownloadLinks(downloadLinks);
      } else if (file.type.startsWith('image/') && convertFormat === 'pdf') {
        const originalSize = inputFiles.reduce((sum, entry) => sum + (entry?.size || 0), 0);
        const pdfArrayBuffer = await createPdfWithMultipleImages(inputFiles);
        const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
        const pdfBlobUrl = URL.createObjectURL(pdfBlob);
        const pdfFileName = getOutputFilename(filename, 'convert');

        setDownloadLinks([{
          url: pdfBlobUrl,
          filename: pdfFileName,
          operation: 'convert',
          isPdf: true,
          originalSize,
          newSize: pdfBlob.size
        }]);
      }
      
      setState('toBeDownloaded');
      setTerminalData('');
      setProgressInfo({ current: 0, total: 0, currentPage: 0 });
      
    } catch (error) {
      console.error('Conversion failed:', error);
      setState('error');
      setErrorMessage(isPasswordError(error) ? t('pdfPasswordProtected') : (error.message || 'An unexpected error occurred during conversion'));
      setTerminalData('');
      setProgressInfo({ current: 0, total: 0, currentPage: 0 });
    }
  }

  /**
   * @description 解析 PDF
   * @param {Array<File>} files - 文件
   */
  async function parsePDF(files) {
    try {
      setDownloadLinks([]);
      setState('loading');
      setTerminalData('');
      setProgressInfo({ current: 0, total: 0, currentPage: 0 });

      const file = files[0]?.file;
      if (!file) return;

      const arrayBuffer = await file.arrayBuffer();

      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      } catch (e) {}

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      pdfDocRef.current = pdf;
      const numPages = pdf.numPages;

      if (showProgressBar) {
        setProgressInfo({ current: 0, total: numPages, currentPage: 0 });
      }

      const pagesText = [];
      const pagesItems = [];
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const text = joinPdfTextItems(textContent.items);
        pagesText.push(text);
        pagesItems.push(textContent.items);

        if (showProgressBar) {
          setProgressInfo(prev => ({ ...prev, current: pageNum, currentPage: pageNum }));
        }
      }

      setParsedPages(pagesText);
      setParsedPageItems(pagesItems);
      setCurrentParsedPage(1);
      setState('parsed');
      setTerminalData('');
      setProgressInfo({ current: 0, total: 0, currentPage: 0 });
    } catch (error) {
      console.error('Parsing failed:', error);
      setState('error');
      setErrorMessage(isPasswordError(error) ? t('pdfPasswordProtected') : (error.message || 'An unexpected error occurred during parsing'));
      setTerminalData('');
      setProgressInfo({ current: 0, total: 0, currentPage: 0 });
    }
  }

  /**
   * @description 获取输出文件名
   * @param {string} originalName - 原始文件名
   * @param {string} operation - 操作类型
   * @returns {string} 输出文件名
   */
  function getOutputFilename(originalName, operation) {
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    switch (operation) {
      case 'compress':
        return `${baseName}-compressed.pdf`;
      case 'merge':
        return `merged-${Date.now()}.pdf`;
      case 'split':
        return `${baseName}-split-${splitRange.startPage}-${splitRange.endPage}.pdf`;
      case 'convert':
        return `${baseName}.${convertFormat}`;
      default:
        return `${baseName}-processed.pdf`;
    }
  }

  const resetParsedState = useCallback(() => {
    setParsedPages([]);
    setParsedPageItems([]);
    setCurrentParsedPage(1);
    if (pdfDocRef?.current) {
      pdfDocRef.current = null;
    }
  }, [setParsedPages, setParsedPageItems, setCurrentParsedPage, pdfDocRef]);

  const resetForm = useCallback(() => {
    files?.forEach(entry => {
      if (entry?.url) {
        try {
          window.URL.revokeObjectURL(entry.url);
        } catch {
          // Ignore revoke failures
        }
      }
    });

    setFiles([]);
    setState('init');
    setErrorMessage('');
    setNotice?.('');
    setDownloadLinks([]);
    setTerminalData('');
    setProgressInfo({ current: 0, total: 0, currentPage: 0 });
    resetParsedState();
    setSelectedPages?.('');
    setPdfPageCount?.(0);
    setConvertFormat?.('');
    setSupportedFormats?.([]);
    setUseAdvancedSettings?.(false);
    setUseCustomCommand?.(false);
    setRepairMode?.(false);
    setCustomCommand?.('');
  }, [
    files,
    setFiles,
    setState,
    setErrorMessage,
    setNotice,
    setDownloadLinks,
    setTerminalData,
    setProgressInfo,
    resetParsedState,
    setSelectedPages,
    setPdfPageCount,
    setConvertFormat,
    setSupportedFormats,
    setUseAdvancedSettings,
    setUseCustomCommand,
    setRepairMode,
    setCustomCommand,
  ]);

  const validateBeforeProcess = useCallback(() => {
    if (!files || files.length === 0) {
      setErrorMessage(t('selectFileToConvert'));
      setState('error');
      return false;
    }

    if (useCustomCommand) {
      if (!customCommand?.trim()) {
        setErrorMessage(t('enterCustomCommand'));
        setState('error');
        return false;
      }

      const trimmed = customCommand.trim();
      if (!/-sDEVICE=/.test(trimmed) || !/-sOutputFile=/.test(trimmed)) {
        setErrorMessage(t('customCommandRequired'));
        setState('error');
        return false;
      }
    }

    if (activeTab === 'merge' && files.length < 2) {
      setErrorMessage(t('selectAtLeastTwoFiles'));
      setState('error');
      return false;
    }

    if (activeTab === 'split') {
      const { startPage, endPage } = splitRange || {};
      if (!startPage || !endPage) {
        setErrorMessage(t('specifyPageRange'));
        setState('error');
        return false;
      }

      const start = Number(startPage);
      const end = Number(endPage);
      if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
        setErrorMessage(t('validPageNumbers'));
        setState('error');
        return false;
      }

      if (pdfPageCount > 0 && end > pdfPageCount) {
        setErrorMessage(t('pageRangeExceedsPages', { count: pdfPageCount }));
        setState('error');
        return false;
      }
    }

    if (activeTab === 'convert' && !convertFormat) {
      setErrorMessage(t('selectFileToConvert'));
      setState('error');
      return false;
    }

    if (activeTab === 'convert' && ['jpg', 'jpeg', 'png', 'bmp'].includes(convertFormat) && pdfPageCount > 0) {
      if (findInvalidPageTokens(selectedPages, pdfPageCount).length > 0) {
        setErrorMessage(t('invalidPageSelection'));
        setState('error');
        return false;
      }
    }

    setErrorMessage('');
    return true;
  }, [files, activeTab, useCustomCommand, customCommand, splitRange, convertFormat, selectedPages, pdfPageCount, setErrorMessage, setState, t]);

  const executeOperation = useCallback(async () => {
    if (!validateBeforeProcess()) {
      return;
    }

    const primary = files[0];
    const baseFilename = primary?.filename || primary?.file?.name || 'output.pdf';

    switch (activeTab) {
      case 'compress':
      case 'merge':
      case 'split':
        await processPDF(activeTab, files, baseFilename);
        break;
      case 'organize':
        if (organizeApply) await organizeApply();
        break;
      case 'convert':
        await convertFile(files, baseFilename);
        break;
      case 'parse':
        await parsePDF(files);
        break;
      default:
        break;
    }
  }, [activeTab, files, validateBeforeProcess, processPDF, convertFile, parsePDF, organizeApply]);

  const onSubmit = useCallback(async (event) => {
    event?.preventDefault?.();
    await executeOperation();
  }, [executeOperation]);

  const processAgain = useCallback(async () => {
    if (!files || files.length === 0) return;
    await executeOperation();
  }, [files, executeOperation]);

  return { onSubmit, resetForm, processAgain };
};