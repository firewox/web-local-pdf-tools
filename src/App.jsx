import { useRef, useEffect } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import { useTranslation } from 'react-i18next';
import { isPdfFile, isImageFile } from './utils/pdf.js';

// Custom Hooks
import { useAppState } from './hooks/useAppState';
import { useSettings } from './hooks/useSettings';
import { usePdfParse } from './hooks/usePdfParse';
import { useFileHandling } from './hooks/useFileHandling';
import { usePdfOperations } from './hooks/usePdfOperations';

// Components
import LoadingPanel from './components/state/LoadingPanel.jsx';
import ErrorPanel from './components/state/ErrorPanel.jsx';
import DownloadList from './components/state/DownloadList.jsx';
import FileSelector from './components/file/FileSelector.jsx';
import SettingsPanel from './components/settings/SettingsPanel.jsx';
import ConvertFormatSelector from './components/settings/ConvertFormatSelector.jsx';
import HeaderNav from './components/common/HeaderNav.jsx';
import OperationIntro from './components/common/OperationIntro.jsx';
import PdfParsePreview from './components/parse/PdfParsePreview.jsx';
import ParsedTextPanel from './components/parse/ParsedTextPanel.jsx';
import PageSubtitle from './components/common/PageSubtitle.jsx';
import ActionSubmit from './components/common/ActionSubmit.jsx';



function App() {
  const { t } = useTranslation();
  const terminalRef = useRef(null);

  const PDF_SETTINGS = {
    screen: t('pdfSettingScreen'),
    ebook: t('pdfSettingEbook'),
    printer: t('pdfSettingPrinter'),
    prepress: t('pdfSettingPrepress'),
    default: t('pdfSettingDefault'),
  };

  const {
    activeTab,
    setActiveTab,
    state,
    setState,
    files,
    setFiles,
    downloadLinks,
    setDownloadLinks,
    errorMessage,
    setErrorMessage,
    showTerminalOutput,
    setShowTerminalOutput,
    showProgressBar,
    setShowProgressBar,
    terminalData,
    setTerminalData,
    progressInfo,
    setProgressInfo,
    pdfUrl,
    fileInfo,
  } = useAppState();

  const {
    pdfSetting,
    setPdfSetting,
    customCommand,
    setCustomCommand,
    useCustomCommand,
    setUseCustomCommand,
    splitRange,
    setSplitRange,
    advancedSettings,
    setAdvancedSettings,
    useAdvancedSettings,
    setUseAdvancedSettings,
    convertFormat,
    setConvertFormat,
    supportedFormats,
    setSupportedFormats,
    selectedPages,
    setSelectedPages,
    pdfPageCount,
    setPdfPageCount,
  } = useSettings();

  const {
    parsedPages,
    setParsedPages,
    currentParsedPage,
    setCurrentParsedPage,
    pdfDocRef,
    canvasRef,
    textLayerRef,
    previewContainerRef,
    rightTextRef,
    parsedPageItems,
    setParsedPageItems,
    highlightMap,
    setHighlightMap,
  } = usePdfParse();

  const {
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
  } = useFileHandling({
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
  });

  const {
    onSubmit,
    resetForm,
    processAgain,
  } = usePdfOperations({
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
    setState,
    setErrorMessage,
    setDownloadLinks,
    setTerminalData,
    setProgressInfo,
    setParsedPages,
    setParsedPageItems,
    setCurrentParsedPage,
    setPdfPageCount,
    showTerminalOutput,
    showProgressBar,
    pdfDocRef,
    t,
  });

  // Auto-scroll terminal output to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalData]);

  // Render pdf to canvas and build text layer for selection
  async function renderPdfPage(pageNum) {
    try {
      const pdf = pdfDocRef.current;
      if (!pdf) return;
      
      // Wait for refs to be available with improved mechanism
      let attempts = 0;
      const maxAttempts = 20; // Increase attempts
      const retryDelay = 150; // Increase delay slightly
      
      while ((!canvasRef.current || !previewContainerRef.current) && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        attempts++;
      }
      
      // Enhanced check for refs availability
      if (!canvasRef.current || !previewContainerRef.current) {
        throw new Error('Canvas or container not properly initialized after waiting');
      }

      // Additional check for DOM readiness
      if (!document.contains(canvasRef.current) || !document.contains(previewContainerRef.current)) {
        // Try one more time with a longer delay
        await new Promise(resolve => setTimeout(resolve, 300));
        if (!document.contains(canvasRef.current) || !document.contains(previewContainerRef.current)) {
          throw new Error('Canvas or container elements not attached to DOM');
        }
      }

      const page = await pdf.getPage(pageNum);
      const viewportBase = page.getViewport({ scale: 1 });
      
      // More robust clientWidth access
      let containerWidth = viewportBase.width;
      if (previewContainerRef.current) {
        containerWidth = previewContainerRef.current.clientWidth || 
                        previewContainerRef.current.offsetWidth || 
                        viewportBase.width;
      }
      
      const scale = containerWidth / viewportBase.width;
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      // Enhanced canvas initialization checks
      if (!canvas) {
        throw new Error('Canvas element is null');
      }
      
      if (typeof canvas.getContext !== 'function') {
        throw new Error('Canvas getContext is not a function');
      }
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get 2D context from canvas');
      }
      
      const dpr = window.devicePixelRatio || 1;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      
      const renderContext = {
        canvasContext: ctx,
        viewport,
        transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null
      };
      
      await page.render(renderContext).promise;

      const textLayerEl = textLayerRef.current;
      if (!textLayerEl) return;
      textLayerEl.innerHTML = '';
      textLayerEl.style.position = 'absolute';
      textLayerEl.style.left = '0';
      textLayerEl.style.top = '0';
      textLayerEl.style.width = `${viewport.width}px`;
      textLayerEl.style.height = `${viewport.height}px`;
      textLayerEl.style.pointerEvents = 'auto';

      const items = parsedPageItems[pageNum - 1] || [];
      items.forEach((item, idx) => {
        let tx = item.transform;
        try { tx = pdfjsLib.Util.transform(viewport.transform, item.transform); } catch {}
        const x = tx[4];
        const y = tx[5];
        const fontSize = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]);
        const span = document.createElement('span');
        span.textContent = item.str;
        span.setAttribute('data-index', String(idx));
        span.style.position = 'absolute';
        span.style.left = `${x}px`;
        span.style.top = `${y - fontSize}px`;
        span.style.fontSize = `${fontSize}px`;
        span.style.whiteSpace = 'pre';
        span.style.lineHeight = '1';
        span.style.color = 'transparent';
        textLayerEl.appendChild(span);
      });

      updateLeftHighlights();
    } catch (error) {
      console.error('Error in renderPdfPage:', error);
      // Don't silently ignore errors, but handle them gracefully
    }
  }

  function updateLeftHighlights() {
    const set = highlightMap[currentParsedPage] || new Set();
    const textLayerEl = textLayerRef.current;
    if (!textLayerEl) return;
    const spans = textLayerEl.querySelectorAll('[data-index]');
    spans.forEach((span) => {
      const idx = parseInt(span.getAttribute('data-index'), 10);
      span.style.backgroundColor = set.has(idx) ? 'rgba(255, 235, 59, 0.35)' : 'transparent';
    });
  }

  function getSelectedIndices(containerEl) {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return [];
    const range = sel.getRangeAt(0);
    const spans = Array.from(containerEl.querySelectorAll('[data-index]'));
    const selected = [];
    for (const span of spans) {
      const r = document.createRange();
      r.selectNodeContents(span);
      if (range.compareBoundaryPoints(Range.END_TO_START, r) < 0 &&
          range.compareBoundaryPoints(Range.START_TO_END, r) > 0) {
        selected.push(parseInt(span.getAttribute('data-index'), 10));
      }
    }
    return selected;
  }

  function setHighlightForCurrentPage(indices) {
    setHighlightMap(prev => ({
      ...prev,
      [currentParsedPage]: new Set(indices)
    }));
  }

  function handleLeftSelection() {
    if (!textLayerRef.current) return;
    const indices = getSelectedIndices(textLayerRef.current);
    if (indices.length > 0) setHighlightForCurrentPage(indices);
  }

  function handleRightSelection() {
    if (!rightTextRef.current) return;
    const indices = getSelectedIndices(rightTextRef.current);
    if (indices.length > 0) {
      setHighlightForCurrentPage(indices);
      updateLeftHighlights();
    }
  }

  useEffect(() => {
    if (state === 'parsed') {
      renderPdfPage(currentParsedPage);
    }
  }, [state, currentParsedPage]);

  useEffect(() => {
    if (state === 'parsed') updateLeftHighlights();
  }, [highlightMap]);

  // Clear left-side highlights when no active selection exists
  useEffect(() => {
    function onSelectionChange() {
      const sel = window.getSelection();
      if (!sel) return;
      const isCollapsed = sel.isCollapsed;
      const leftEl = textLayerRef.current;
      const rightEl = rightTextRef.current;
      const anchor = sel.anchorNode;
      const focus = sel.focusNode;
      const containsIn = (el, node) => el && node && el.contains(node);
      const inOurAreas = containsIn(leftEl, anchor) || containsIn(rightEl, anchor) ||
                         containsIn(leftEl, focus) || containsIn(rightEl, focus);
      if (state === 'parsed' && (isCollapsed || !inOurAreas)) {
        setHighlightMap(prev => ({
          ...prev,
          [currentParsedPage]: new Set()
        }));
      }
    }
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, [state, currentParsedPage]);




  const isImageReorderMode = () => (
    activeTab === 'convert' && files.length > 1 && files.every(item => isImageFile(item.file))
  );

  // Check if file reordering is enabled (for both merge and convert modes)
  const isFileReorderEnabled = () => (
    (activeTab === 'merge' && files.length > 1) || isImageReorderMode()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted-50 to-muted-100 dark:from-gray-900 dark:to-gray-800">
      {/* Responsive Navbar Header */}
      <HeaderNav t={t} activeTab={activeTab} setActiveTab={setActiveTab} resetForm={resetForm} />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Info below navbar */}
        <PageSubtitle t={t} />

        {/* Tabs removed per specification: switching via top bar menu only */}

        {/* Tab Content */}
        <OperationIntro t={t} activeTab={activeTab} />

        {state !== "loading" && state !== "toBeDownloaded" && state !== "error" && (
          <form onSubmit={onSubmit} className="space-y-8">
            <FileSelector
              t={t}
              activeTab={activeTab}
              files={files}
              changeHandler={changeHandler}
              clearAllFiles={clearAllFiles}
              removeFile={removeFile}
              addMoreFiles={addMoreFiles}
              draggingIndex={draggingIndex}
              dragOverIndex={dragOverIndex}
              handleDragStart={handleDragStart}
              handleDragEnter={handleDragEnter}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleDragEnd={handleDragEnd}
              fileReorderEnabled={isFileReorderEnabled()}
              imageReorderMode={isImageReorderMode()}
            />
        
        {files.length > 0 && state === "selected" && activeTab === 'convert' && (
          <div className="card mt-6">
            <ConvertFormatSelector
              t={t}
              convertFormat={convertFormat}
              setConvertFormat={setConvertFormat}
              supportedFormats={supportedFormats}
            />
          </div>
        )}
        
        <SettingsPanel
          t={t}
          useCustomCommand={useCustomCommand}
          customCommand={customCommand}
          setCustomCommand={setCustomCommand}
          PDF_SETTINGS={PDF_SETTINGS}
          activeTab={activeTab}
          pdfSetting={pdfSetting}
          setPdfSetting={setPdfSetting}
          splitRange={splitRange}
          setSplitRange={setSplitRange}
          showTerminalOutput={showTerminalOutput}
          setShowTerminalOutput={setShowTerminalOutput}
          showProgressBar={showProgressBar}
          setShowProgressBar={setShowProgressBar}
          useAdvancedSettings={useAdvancedSettings}
          setUseAdvancedSettings={setUseAdvancedSettings}
          advancedSettings={advancedSettings}
          setAdvancedSettings={setAdvancedSettings}
          convertFormat={convertFormat}
          files={files}
          selectedPages={selectedPages}
          setSelectedPages={setSelectedPages}
          pdfPageCount={pdfPageCount}
          isPdfSelected={files.some(f => isPdfFile(f.file))}
        />

        {state === "selected" && (
          <ActionSubmit t={t} activeTab={activeTab} convertFormat={convertFormat} />
        )}
          </form>
        )}

        {state === "loading" && (
          <LoadingPanel
            t={t}
            activeTab={activeTab}
            showProgressBar={showProgressBar}
            progressInfo={progressInfo}
            showTerminalOutput={showTerminalOutput}
            terminalData={terminalData}
            terminalRef={terminalRef}
          />
        )}

        {state === "error" && (
          <ErrorPanel t={t} errorMessage={errorMessage} onTryAgain={resetForm} />
        )}

        {state === "parsed" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PdfParsePreview
              t={t}
              previewContainerRef={previewContainerRef}
              canvasRef={canvasRef}
              textLayerRef={textLayerRef}
              handleLeftSelection={handleLeftSelection}
            />

            <ParsedTextPanel
              t={t}
              parsedPages={parsedPages}
              parsedPageItems={parsedPageItems}
              currentParsedPage={currentParsedPage}
              setCurrentParsedPage={setCurrentParsedPage}
              rightTextRef={rightTextRef}
              handleRightSelection={handleRightSelection}
              baseFilename={(files[0]?.filename || 'output.pdf')}
            />
          </div>
        )}

        {state === "toBeDownloaded" && (
          <DownloadList
            t={t}
            downloadLinks={downloadLinks}
            onProcessAgain={processAgain}
            onChooseNewFiles={() => {
              resetForm();
              setTimeout(() => {
                document.getElementById('files').click();
              }, 100);
            }}
          />
        )}

        {/* Info Section */}
        <div className="card mt-12">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('features')}</h4>
          <ul className="space-y-2 text-muted-600 dark:text-muted-300 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 font-bold">•</span>
              <span><strong className="text-gray-900 dark:text-white">{t('compress')}:</strong> {t('compressFeature')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 font-bold">•</span>
              <span><strong className="text-gray-900 dark:text-white">{t('merge')}:</strong> {t('mergeFeature')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 font-bold">•</span>
              <span><strong className="text-gray-900 dark:text-white">{t('split')}:</strong> {t('splitFeature')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 font-bold">•</span>
              <span><strong className="text-gray-900 dark:text-white">{t('parse')}:</strong> {t('parseFeature')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 font-bold">•</span>
              <span><strong className="text-gray-900 dark:text-white">Progress Bar:</strong> {t('progressBarFeature')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 font-bold">•</span>
              <span><strong className="text-gray-900 dark:text-white">{t('convert')}:</strong> {t('convertFeature')}</span>
            </li>
          </ul>

          <div className="border-t border-muted-200 dark:border-gray-700 pt-6">
            <p className="text-muted-600 dark:text-muted-300 mb-4">
              <strong className="text-gray-900 dark:text-white">{t('privacySecurity')}</strong><br />
              {t('privacyText')}
            </p>

            <a
              href="https://github.com/firewox/web-local-pdf-tools"
              target="_blank"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium underline decoration-2 underline-offset-2"
            >
              {t('viewSourceCode')}
            </a>
          </div>
        </div>

        <div className="card mt-12">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Sponsor Button */}
            <a
              id="sponsor-profile-button"
              href="https://github.com/sponsors/firewox"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center px-6 py-2 rounded-lg font-medium border border-pink-400 text-pink-600 bg-white shadow-soft"
              title="Sponsor @firewox on GitHub"
            >
              <svg aria-hidden="true" height="20" viewBox="0 0 16 16" width="20" className="mr-2 v-align-middle text-pink-500" fill="currentColor">
                <path d="m8 14.25.345.666a.75.75 0 0 1-.69 0l-.008-.004-.018-.01a7.152 7.152 0 0 1-.31-.17 22.055 22.055 0 0 1-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.25 1 5.797 1 7.153 1.802 8 3.02 8.847 1.802 10.203 1 11.75 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.066 22.066 0 0 1-3.744 2.584l-.018.01-.006.003h-.002ZM4.25 2.5c-1.336 0-2.75 1.164-2.75 3 0 2.15 1.58 4.144 3.365 5.682A20.58 20.58 0 0 0 8 13.393a20.58 20.58 0 0 0 3.135-2.211C12.92 9.644 14.5 7.65 14.5 5.5c0-1.836-1.414-3-2.75-3-1.373 0-2.609.986-3.029 2.456a.749.749 0 0 1-1.442 0C6.859 3.486 5.623 2.5 4.25 2.5Z"></path>
              </svg>
              <span className="v-align-middle font-semibold">{t('sponsor')}</span>
            </a>
            {/* Buy Me A Coffee Button */}
            <a href="https://www.buymeacoffee.com/firewox" target="_blank" rel="noopener noreferrer">
              <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style={{ height: '40px', width: '145px' }} />
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-muted-200 dark:border-gray-700 pt-6">
          <div className="flex justify-between items-center">
            <p className="text-muted-600 dark:text-muted-300">
              {t('copyright', { year: new Date().getFullYear() })}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
