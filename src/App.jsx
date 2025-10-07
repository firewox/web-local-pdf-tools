import { useState, useRef, useEffect } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import { useTranslation } from 'react-i18next';
import { _GSPS2PDF } from "./lib/worker-init.js";
import RightButtonBar from './components/RightButtonBar.jsx';

function loadPDFData(response, filename) {
  return new Promise((resolve, reject) => {
    try {
      // If response is already a blob URL (from createSimplePdfWithImage)
      if (typeof response === 'string' && response.startsWith('blob:')) {
        // Directly use the blob URL without unnecessary conversion
        // Create a quick HEAD request to get file size without downloading full content
        const xhr = new XMLHttpRequest();
        xhr.open('HEAD', response);
        xhr.onload = function() {
          try {
            // For blob URLs, we can't get the actual size from headers
            // So we estimate based on response type
            const estimatedSize = 0; // Will be updated later when actual data is loaded
            resolve({ pdfURL: response, size: estimatedSize });
          } catch (error) {
            console.error('Error in HEAD request:', error);
            // Fallback to using the original URL directly
            resolve({ pdfURL: response, size: 0 });
          }
        };
        xhr.onerror = function() {
          // If HEAD request fails, just use the original URL
          resolve({ pdfURL: response, size: 0 });
        };
        xhr.send();
      } else {
        // Original handling for array buffer data
        const xhr = new XMLHttpRequest();
        xhr.open("GET", response);
        xhr.responseType = "arraybuffer";
        xhr.onload = function () {
          try {
            window.URL.revokeObjectURL(response);
            const blob = new Blob([xhr.response], { type: "application/pdf" });
            const pdfURL = window.URL.createObjectURL(blob);
            const size = xhr.response.byteLength;
            resolve({ pdfURL, size });
          } catch (error) {
            console.error('Error creating blob from array buffer:', error);
            reject(error);
          }
        };
        xhr.onerror = function () {
          reject(new Error('Failed to load PDF data'));
        };
        xhr.send();
      }
    } catch (error) {
      console.error('Error in loadPDFData:', error);
      reject(error);
    }
  });
}

function App() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("compress");
  const [state, setState] = useState("init");
  const [files, setFiles] = useState([]);
  const [downloadLinks, setDownloadLinks] = useState([]);
  const [pdfSetting, setPdfSetting] = useState("/ebook");
  const [customCommand, setCustomCommand] = useState("");
  const [useCustomCommand, setUseCustomCommand] = useState(false);
  const [splitRange, setSplitRange] = useState({ startPage: "", endPage: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [showTerminalOutput, setShowTerminalOutput] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [terminalData, setTerminalData] = useState("");
  const [progressInfo, setProgressInfo] = useState({ current: 0, total: 0, currentPage: 0 });
  const terminalRef = useRef(null);
  const [parsedPages, setParsedPages] = useState([]);
  const [currentParsedPage, setCurrentParsedPage] = useState(1);
  // Parse preview & highlight state
  const pdfDocRef = useRef(null);
  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const previewContainerRef = useRef(null);
  const rightTextRef = useRef(null);
  const [parsedPageItems, setParsedPageItems] = useState([]);
  const [highlightMap, setHighlightMap] = useState({});
  
  // PDF preview and file info states
  const [pdfUrl, setPdfUrl] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);

  // PDF Settings presets
  const PDF_SETTINGS = {
    '/screen': t('screenOptimized'),
    '/ebook': t('ebook'),
    '/printer': t('printer'),
    '/prepress': t('prepress'),
    '/default': t('default')
  };

  // Simplified advanced PDF settings
  const [advancedSettings, setAdvancedSettings] = useState({
    compatibilityLevel: "1.4",
    colorImageSettings: {
      downsample: true,
      resolution: 300
    }
  });
  const [useAdvancedSettings, setUseAdvancedSettings] = useState(false);
  
  // Convert feature state
  const [convertFormat, setConvertFormat] = useState("");
  const [supportedFormats, setSupportedFormats] = useState([]);
  
  // PDF to image page selection state
  const [selectedPages, setSelectedPages] = useState("");
  const [pdfPageCount, setPdfPageCount] = useState(0);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragSourceIndexRef = useRef(null);

  // PDF Preview component for converted PDFs
  const PdfPreview = ({ url }) => {
    const [pdfDoc, setPdfDoc] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [renderReady, setRenderReady] = useState(false);
    const canvasRef = useRef(null);
    const previewContainerRef = useRef(null);
    const mountedRef = useRef(true);

    // Cleanup on unmount
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
          
          // Configure worker for pdfjs - simplified approach
          try {
            if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
              try {
                pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
              } catch (e) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
              }
            }
          } catch (e) {
            console.warn('Worker configuration skipped:', e);
          }

          // Load the PDF document with optimized options
          const loadingTask = pdfjsLib.getDocument({
            url: url,
            disableAutoFetch: true,  // Faster initial load
            disableStream: true,     // Better for small PDFs
            enableXfa: false,
            ignoreErrors: true
          });
          
          const pdf = await loadingTask.promise;
          
          if (!mountedRef.current) return;
          
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setCurrentPage(1);
          setLoading(false);
          
          // Signal that we're ready to render
          setTimeout(() => {
            if (mountedRef.current) {
              setRenderReady(true);
            }
          }, 100);
        } catch (error) {
          console.error('Error loading PDF for preview:', error);
          if (mountedRef.current) {
            setError(error.message || 'Failed to load PDF');
            setLoading(false);
          }
        }
      };

      loadPdf();
    }, [url]);

    useEffect(() => {
      if (!pdfDoc || !renderReady) return;

      const renderPage = async () => {
        try {
          if (!mountedRef.current) return;
          
          setLoading(true);
          setError(null);

          // Wait a bit for the DOM to be ready
          await new Promise(resolve => setTimeout(resolve, 50));
          
          if (!mountedRef.current) return;

          // Get the canvas element
          const canvas = canvasRef.current;
          if (!canvas) {
            console.warn('Canvas ref not available yet');
            return;
          }

          // Ensure canvas is in DOM
          if (!document.contains(canvas)) {
            console.warn('Canvas not in DOM yet');
            return;
          }

          const page = await pdfDoc.getPage(currentPage);
          const viewportBase = page.getViewport({ scale: 1 });
          
          // Calculate container width with fallback
          let containerWidth = 600; // Default width
          if (previewContainerRef.current) {
            const measured = previewContainerRef.current.clientWidth || 
                           previewContainerRef.current.offsetWidth;
            if (measured > 0) {
              containerWidth = measured;
            }
          }
          
          // Calculate scale with reasonable bounds
          const scale = Math.max(0.5, Math.min(containerWidth / viewportBase.width, 2.5));
          const viewport = page.getViewport({ scale });

          // Get canvas context
          const ctx = canvas.getContext('2d', { alpha: false });
          if (!ctx) {
            throw new Error('Failed to get canvas 2D context');
          }
          
          // Set canvas dimensions
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          
          // Clear canvas before rendering
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
            enableWebGL: false,
            renderInteractiveForms: false,
            intent: 'display'
          };

          // Render with timeout protection
          const renderPromise = page.render(renderContext).promise;
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Render timeout')), 15000);
          });

          await Promise.race([renderPromise, timeoutPromise]);
          
          if (mountedRef.current) {
            setLoading(false);
          }
        } catch (error) {
          console.error('Error rendering PDF page:', error);
          if (mountedRef.current) {
            setError('Failed to render PDF page');
            setLoading(false);
          }
        }
      };

      renderPage();
    }, [pdfDoc, currentPage, renderReady]);

    const goToPrevPage = () => {
      if (currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    };

    const goToNextPage = () => {
      if (currentPage < totalPages) {
        setCurrentPage(prev => prev + 1);
      }
    };

    if (!url) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">PDF</span>
          </div>
          <p className="text-muted-600 dark:text-muted-400">
            No PDF available for preview
          </p>
        </div>
      );
    }

    if (loading && !renderReady) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
          <p className="text-muted-600 dark:text-muted-400">
            Loading PDF...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">!</span>
          </div>
          <p className="text-muted-600 dark:text-muted-400">
            {error}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4 w-full">
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              className="btn-secondary px-3 py-1.5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('prev')}
            </button>
            <span className="text-sm text-muted-600 dark:text-muted-400">
              {t('page')} {currentPage} / {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage >= totalPages}
              className="btn-secondary px-3 py-1.5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('next')}
            </button>
          </div>
        )}
        
        <div ref={previewContainerRef} className="w-full bg-white dark:bg-gray-900 p-4 rounded-lg flex items-center justify-center">
          <canvas 
            ref={canvasRef} 
            className="max-w-full h-auto shadow-lg"
            style={{ display: 'block' }}
          />
        </div>
        
        {loading && (
          <div className="text-center py-2">
            <span className="text-sm text-muted-600 dark:text-muted-400">Rendering...</span>
          </div>
        )}
      </div>
    );
  };

  // Auto-scroll terminal output to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalData]);

  // Function to extract progress information from terminal output
  const parseProgressFromOutput = (output) => {
    // Extract total pages from "Processing pages X through Y"
    const totalPagesMatch = output.match(/Processing pages \d+ through (\d+)/);
    if (totalPagesMatch) {
      const totalPages = parseInt(totalPagesMatch[1]);
      setProgressInfo(prev => ({ ...prev, total: totalPages }));
    }

    // Extract current page from "Page X" 
    const currentPageMatch = output.match(/^Page (\d+)$/);
    if (currentPageMatch) {
      const currentPage = parseInt(currentPageMatch[1]);
      setProgressInfo(prev => ({
        ...prev,
        currentPage: currentPage,
        current: currentPage // Update current to match the page being processed
      }));
    }
  };

  async function processPDF(operation, inputFiles, filename) {
    setState("loading");
    setTerminalData(""); // Clear previous terminal data
    setProgressInfo({ current: 0, total: 0, currentPage: 0 }); // Reset progress

    try {
      let dataObject = {
        operation,
        pdfSetting: useCustomCommand ? null : pdfSetting,
        customCommand: useCustomCommand ? customCommand : null,
        advancedSettings: useAdvancedSettings ? advancedSettings : null,
        showTerminalOutput: showTerminalOutput, // Pass terminal output setting to worker
        showProgressBar: showProgressBar, // Pass progress bar setting to worker
        convertFormat: activeTab === 'convert' ? convertFormat : null
      };

      if (operation === 'merge') {
        dataObject.files = inputFiles.map(file => file.url);
      } else if (operation === 'split') {
        dataObject.psDataURL = inputFiles[0].url;
        dataObject.splitRange = splitRange;
      } else {
        // compress
        dataObject.psDataURL = inputFiles[0].url;
      }

      const result = await _GSPS2PDF(
        dataObject,
        null, // responseCallback (not used in promise version)
        (showTerminalOutput || showProgressBar) ? (outputText) => {
          // Update terminal output if enabled
          if (showTerminalOutput) {
            setTerminalData(prev => prev + outputText + '\n');
          }
          // Parse progress information if progress bar is enabled
          if (showProgressBar) {
            parseProgressFromOutput(outputText);
          }
        } : null // outputCallback
      );

      // Check for errors in the result
      if (result.error) {
        console.error("Processing failed:", result.error);
        setState("error");
        setErrorMessage(result.error);
        setTerminalData(""); // Clear terminal output on error
        setProgressInfo({ current: 0, total: 0, currentPage: 0 }); // Reset progress on error
        return;
      }

      const { pdfURL, size: newSize } = await loadPDFData(result.pdfDataURL, filename);

      setDownloadLinks([{
        url: pdfURL,
        filename: getOutputFilename(filename, operation),
        operation
      }]);
      setState("toBeDownloaded");
      setTerminalData(""); // Clear terminal output when done
      setProgressInfo({ current: 0, total: 0, currentPage: 0 }); // Reset progress when done

    } catch (error) {
      console.error("Processing failed:", error);
      setState("error");
      setErrorMessage(error.message || "An unexpected error occurred during processing");
      setTerminalData(""); // Clear terminal output on error
      setProgressInfo({ current: 0, total: 0, currentPage: 0 }); // Reset progress on error
    }
  }

  // Parse PDF text content per page using pdfjs-dist
  

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
  async function parsePDF(files) {
    try {
      const file = files[0]?.file;
      if (!file) return;

      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Configure worker for pdfjs
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      } catch (e) {
        // Fallback silently if configuration fails
      }

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
        const text = textContent.items.map(item => item.str).join(' ');
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
      setErrorMessage(error.message || 'An unexpected error occurred during parsing');
      setTerminalData('');
      setProgressInfo({ current: 0, total: 0, currentPage: 0 });
    }
  }

  function getOutputFilename(originalName, operation) {
    const baseName = originalName.replace(/\.[^/.]+$/, ''); // Remove extension
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

  // Helper function to parse page ranges like "1,3-5,7"
  function parsePageSelection(selection, totalPages) {
    if (!selection || selection.trim() === '') {
      // If no selection, return all pages
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const pages = new Set();
    const parts = selection.split(',');
    
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      
      // Check if it's a range (e.g., 3-5)
      const rangeMatch = trimmed.match(/^(\d+)-(\d+)$/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1]);
        const end = parseInt(rangeMatch[2]);
        
        if (!isNaN(start) && !isNaN(end) && start <= end && start >= 1 && end <= totalPages) {
          for (let i = start; i <= end; i++) {
            pages.add(i);
          }
        }
      } else {
        // Check if it's a single page
        const pageNum = parseInt(trimmed);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
          pages.add(pageNum);
        }
      }
    }
    
    return Array.from(pages).sort((a, b) => a - b);
  }

  const isPdfFile = (file) => {
    if (!file) return false;
    const name = file.name?.toLowerCase() || '';
    return file.type === 'application/pdf' || name.endsWith('.pdf');
  };

  const isImageFile = (file) => {
    if (!file) return false;
    if (file.type?.startsWith('image/')) return true;
    return /\.(jpg|jpeg|png|bmp)$/i.test(file.name || '');
  };

  const loadPdfPageCount = async (file) => {
    try {
      if (!file) {
        setPdfPageCount(0);
        return;
      }

      const arrayBuffer = await file.arrayBuffer();
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      } catch (e) {
        // Ignore worker configuration errors here
      }
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      setPdfPageCount(pdf.numPages || 0);
    } catch (error) {
      console.error('Failed to load PDF metadata:', error);
      setPdfPageCount(0);
    }
  };

  const reorderFiles = (list, startIndex, endIndex) => {
    const updated = [...list];
    const [removed] = updated.splice(startIndex, 1);
    updated.splice(endIndex, 0, removed);
    return updated;
  };

  const isImageReorderMode = () => (
    activeTab === 'convert' && files.length > 1 && files.every(item => isImageFile(item.file))
  );

  async function convertFile(inputFiles, filename) {
    setState("loading");
    setTerminalData(""); // Clear previous terminal data
    setProgressInfo({ current: 0, total: 0, currentPage: 0 }); // Reset progress

    try {
      const file = inputFiles[0].file;
      const fileType = file.type;

      // For PDF to image conversion
      if (isPdfFile(file) && ['jpg', 'jpeg', 'png', 'bmp'].includes(convertFormat)) {
        // Configure worker for pdfjs
        try {
          pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
        } catch (e) {
          // Fallback silently if configuration fails
        }

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        
        // Set page count for UI display
        setPdfPageCount(numPages);
        
        // Parse user selected pages or use all pages
        const pagesToConvert = parsePageSelection(selectedPages, numPages);
        if (pagesToConvert.length === 0) {
          throw new Error(t('invalidPageSelection'));
        }
        setProgressInfo({ current: 0, total: pagesToConvert.length, currentPage: 0 });

        // Convert selected pages to images
        const downloadLinks = [];
        
        for (const [index, pageNum] of pagesToConvert.entries()) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2.0 });
          
          const canvas = document.createElement('canvas');
          // Safely access getContext with null check
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
          
          // Convert canvas to image
          const imageUrl = canvas.toDataURL(`image/${convertFormat === 'jpg' ? 'jpeg' : convertFormat}`);
          
          // Create blob from data URL
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          
          // Create filename with page number
          const baseName = filename.replace(/\.pdf$/i, '');
          const pageFilename = numPages > 1 ? 
            `${baseName}-page-${pageNum}.${convertFormat}` : 
            `${baseName}.${convertFormat}`;
          
          downloadLinks.push({
            url: url,
            filename: pageFilename,
            operation: 'convert',
            page: pageNum,
            totalPages: numPages
          });
          
          // Update progress
          setProgressInfo({ current: index + 1, total: pagesToConvert.length, currentPage: pageNum });
        }
        
        setDownloadLinks(downloadLinks);
      }
      // For image to PDF conversion - support multiple images
      else if (isImageFile(file) && convertFormat === 'pdf') {
        const pdfArrayBuffer = await createPdfWithMultipleImages(inputFiles);

        // Convert the ArrayBuffer to a Blob
        const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
        
        // Create a blob URL for the PDF
        const pdfBlobUrl = URL.createObjectURL(pdfBlob);
        
        // Set file info with actual size
        const fileSize = pdfBlob.size;
        const pdfFileName = getOutputFilename(filename, 'convert');
        
        // Set download links with the PDF
        setDownloadLinks([{
          url: pdfBlobUrl,
          filename: pdfFileName,
          operation: 'convert',
          isPdf: true  // Add flag to indicate this is a PDF for preview
        }]);
      }
      
      setState("toBeDownloaded");
      setTerminalData(""); // Clear terminal output when done
      setProgressInfo({ current: 0, total: 0, currentPage: 0 }); // Reset progress when done
      
    } catch (error) {
      console.error("Conversion failed:", error);
      setState("error");
      setErrorMessage(error.message || "An unexpected error occurred during conversion");
      setTerminalData(""); // Clear terminal output on error
      setProgressInfo({ current: 0, total: 0, currentPage: 0 }); // Reset progress on error
    }
  }

  // Helper function to create a PDF with multiple images
  async function createPdfWithMultipleImages(inputFiles) {
    if (!inputFiles || inputFiles.length === 0) {
      throw new Error('No images supplied for PDF generation');
    }

    try {
      const { jsPDF } = await import('jspdf');

      const imageEntries = [];

      // Preload all images to gather dimensions
      for (let i = 0; i < inputFiles.length; i++) {
        const file = inputFiles[i].file;
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const dimensions = await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.width, height: img.height });
          img.onerror = reject;
          img.src = dataUrl;
        });

        imageEntries.push({
          file,
          dataUrl,
          width: dimensions.width,
          height: dimensions.height
        });
      }

      const maxWidth = Math.max(...imageEntries.map((img) => img.width), 1);
      const maxHeight = Math.max(...imageEntries.map((img) => img.height), 1);

      const orientation = maxWidth >= maxHeight ? 'landscape' : 'portrait';
      const doc = new jsPDF({
        orientation,
        unit: 'px',
        format: [maxWidth, maxHeight]
      });

      setProgressInfo({ current: 0, total: imageEntries.length, currentPage: 0 });

      for (let i = 0; i < imageEntries.length; i++) {
        const { file, dataUrl, width, height } = imageEntries[i];

        if (i > 0) {
          doc.addPage([maxWidth, maxHeight], orientation);
        }

        const scale = Math.min(maxWidth / width, maxHeight / height);
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;
        const offsetX = (maxWidth - scaledWidth) / 2;
        const offsetY = (maxHeight - scaledHeight) / 2;

        const imageFormat = file.type.includes('png') ? 'PNG' : 'JPEG';

        doc.addImage(dataUrl, imageFormat, offsetX, offsetY, scaledWidth, scaledHeight, undefined, 'FAST');

        setProgressInfo({ current: i + 1, total: imageEntries.length, currentPage: 0 });
      }

      return doc.output('arraybuffer');
    } catch (error) {
      console.error('Error creating PDF from multiple images:', error);
      throw error;
    }
  }

  const changeHandler = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length === 0) {
      return;
    }

    if (activeTab === 'convert') {
      const containsPdf = selectedFiles.some(isPdfFile);
      const containsImage = selectedFiles.some(isImageFile);

      if (containsPdf && containsImage) {
        alert(t('mixedConvertTypesNotSupported'));
        return;
      }

      if (containsPdf) {
        const pdfFile = selectedFiles.find(isPdfFile);
        if (!pdfFile) {
          return;
        }

        // Clean up existing object URLs
        files.forEach(file => {
          window.URL.revokeObjectURL(file.url);
        });

        const pdfObject = {
          filename: pdfFile.name,
          url: window.URL.createObjectURL(pdfFile),
          file: pdfFile
        };

        setFiles([pdfObject]);
        setSupportedFormats([
          { value: 'jpg', label: 'JPG' },
          { value: 'png', label: 'PNG' },
          { value: 'jpeg', label: 'JPEG' },
          { value: 'bmp', label: 'BMP' }
        ]);
        setConvertFormat((prev) => ['jpg', 'png', 'jpeg', 'bmp'].includes(prev) ? prev : 'jpg');
        setSelectedPages('');
        setPdfPageCount(0);
        await loadPdfPageCount(pdfFile);
      } else if (containsImage) {
        const imageFiles = selectedFiles.filter(isImageFile);
        if (imageFiles.length === 0) {
          return;
        }

        const imageObjects = imageFiles.map(file => ({
          filename: file.name,
          url: window.URL.createObjectURL(file),
          file
        }));

        setFiles(prevFiles => {
          const existingImages = prevFiles.filter(item => {
            const keep = isImageFile(item.file);
            if (!keep) {
              window.URL.revokeObjectURL(item.url);
            }
            return keep;
          });
          return [...existingImages, ...imageObjects];
        });
        setSupportedFormats([{ value: 'pdf', label: 'PDF' }]);
        if (convertFormat !== 'pdf') {
          setConvertFormat('pdf');
        }
        setPdfPageCount(0);
        setSelectedPages('');
      } else {
        alert(t('unsupportedConvertType'));
        return;
      }

      setDownloadLinks([]);
      setPdfUrl(null);
      setFileInfo(null);
      setDraggingIndex(null);
      setDragOverIndex(null);
      dragSourceIndexRef.current = null;
    } else {
      const fileObjects = selectedFiles.map(file => ({
        filename: file.name,
        url: window.URL.createObjectURL(file),
        file
      }));

      if (activeTab === 'merge') {
        setFiles(prevFiles => [...prevFiles, ...fileObjects]);
      } else {
        files.forEach(file => {
          window.URL.revokeObjectURL(file.url);
        });
        setFiles(fileObjects.slice(0, 1));
      }
    }

    setState('selected');
  };

  const handleDragStart = (index) => (event) => {
    if (!isImageReorderMode()) return;
    dragSourceIndexRef.current = index;
    setDraggingIndex(index);
    setDragOverIndex(index);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      try {
        event.dataTransfer.setData('text/plain', String(index));
      } catch (e) {
        // Some browsers might block setting data; ignore
      }
    }
  };

  const handleDragEnter = (index) => (event) => {
    if (!isImageReorderMode() || dragSourceIndexRef.current === null) return;
    event.preventDefault();
    if (index !== dragOverIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragOver = (event) => {
    if (!isImageReorderMode() || dragSourceIndexRef.current === null) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (index) => (event) => {
    if (!isImageReorderMode() || dragSourceIndexRef.current === null) return;
    event.preventDefault();
    const sourceIndex = dragSourceIndexRef.current;
    if (sourceIndex === index) {
      handleDragEnd();
      return;
    }
    setFiles(prevFiles => reorderFiles(prevFiles, sourceIndex, index));
    handleDragEnd();
  };

  const handleDragEnd = () => {
    dragSourceIndexRef.current = null;
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  const removeFile = (indexToRemove) => {
    const fileToRemove = files[indexToRemove];
    if (fileToRemove) {
      window.URL.revokeObjectURL(fileToRemove.url);
    }

    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(updatedFiles);

    if (updatedFiles.length === 0) {
      setState('init');
      setSupportedFormats([]);
      setConvertFormat('');
      setSelectedPages('');
      setPdfPageCount(0);
      setDraggingIndex(null);
      setDragOverIndex(null);
      dragSourceIndexRef.current = null;
    }
  };

  const clearAllFiles = () => {
    // Clean up blob URLs
    files.forEach(file => {
      window.URL.revokeObjectURL(file.url);
    });
    setFiles([]);
    setState("init");
    setSupportedFormats([]);
    setConvertFormat('');
    setSelectedPages('');
    setPdfPageCount(0);
    setDraggingIndex(null);
    setDragOverIndex(null);
    dragSourceIndexRef.current = null;
  };

  const addMoreFiles = () => {
    document.getElementById('files').click();
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (files.length === 0) return false;

    // Validation
    if (activeTab === 'merge' && files.length < 2) {
      alert(t('selectAtLeastTwoFiles'));
      return false;
    }

    if (activeTab === 'split' && (!splitRange.startPage || !splitRange.endPage)) {
      alert(t('specifyPageRange'));
      return false;
    }

    if (activeTab === 'split') {
      const startPage = parseInt(splitRange.startPage);
      const endPage = parseInt(splitRange.endPage);
      if (isNaN(startPage) || isNaN(endPage) || startPage < 1 || endPage < startPage) {
        alert(t('validPageNumbers'));
        return false;
      }
    }

    if (activeTab === 'convert' && !convertFormat) {
      alert('Please select a target format for conversion');
      return false;
    }

    const primaryFilename = files[0]?.filename || 'output.pdf';
    if (activeTab === 'parse') {
      parsePDF(files);
    } else if (activeTab === 'convert') {
      convertFile(files, primaryFilename);
    } else {
      processPDF(activeTab, files, primaryFilename);
    }
    return false;
  };

  const resetForm = () => {
    // Clean up blob URLs
    files.forEach(file => {
      window.URL.revokeObjectURL(file.url);
    });
    downloadLinks.forEach(link => {
      window.URL.revokeObjectURL(link.url);
    });

    setFiles([]);
    setDownloadLinks([]);
    setState("init");
    setSplitRange({ startPage: "", endPage: "" });
    setErrorMessage("");
    setTerminalData(""); // Clear terminal output
    setProgressInfo({ current: 0, total: 0, currentPage: 0 }); // Reset progress
    setUseAdvancedSettings(false);
    setAdvancedSettings({
      compatibilityLevel: "1.4",
      colorImageSettings: {
        downsample: true,
        resolution: 300
      }
    });
    // Reset convert feature state
    setConvertFormat("");
    setSupportedFormats([]);
    setSelectedPages('');
    setPdfPageCount(0);
    setPdfUrl(null);
    setFileInfo(null);
    setDraggingIndex(null);
    setDragOverIndex(null);
    dragSourceIndexRef.current = null;
  };

  const processAgain = () => {
    // Keep the files but reset to selected state
    downloadLinks.forEach(link => {
      window.URL.revokeObjectURL(link.url);
    });
    setDownloadLinks([]);
    setState("selected");
    setErrorMessage("");
    setTerminalData(""); // Clear terminal output
    setProgressInfo({ current: 0, total: 0, currentPage: 0 }); // Reset progress
  };

  const renderFileInput = () => {
  const accept = activeTab === 'convert' ? "application/pdf,image/*,.jpg,.jpeg,.png,.bmp" : "application/pdf";
  const multiple = activeTab === 'merge' || activeTab === 'convert';

    return (
      <div className="space-y-6">
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          name="files"
          onChange={changeHandler}
          id="files"
          className="hidden"
        />
        <div className="text-center">
          <label
            htmlFor="files"
            className="btn-primary cursor-pointer text-lg px-8 py-4 rounded-xl"
          >
            {files.length === 0
              ? t('chooseFiles', { 
                  count: multiple ? 's' : '', 
                  operation: t(activeTab).toLowerCase() 
                })
              : t('filesSelected', { count: files.length })
            }
          </label>
        </div>

        {files.length > 0 && (
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <span className="text-sm font-medium text-muted-600 dark:text-muted-400">
                {t('filesSelected', { count: files.length })}
              </span>
              <button
                type="button"
                className="btn-danger text-sm px-4 py-2 rounded-xl"
                onClick={clearAllFiles}
                title={t('clearAll')}
              >
                {t('clearAll')}
              </button>
            </div>

            <div className="space-y-3">
              {files.map((file, index) => {
                const reorderEnabled = isImageReorderMode();
                const isDraggingItem = draggingIndex === index;
                const isDropTarget = dragOverIndex === index && draggingIndex !== null && draggingIndex !== index;
                const baseClasses = "flex items-center justify-between p-4 bg-muted-50 dark:bg-gray-700 border border-muted-200 dark:border-gray-600 rounded-xl transition-all duration-150";
                const dragClasses = reorderEnabled ? " cursor-grab active:cursor-grabbing" : "";
                const highlightClasses = [
                  isDraggingItem ? "opacity-75 ring-2 ring-primary-400" : "",
                  isDropTarget ? "ring-2 ring-primary-500 bg-primary-50/60 dark:bg-primary-900/20" : ""
                ].join(' ');

                return (
                  <div
                    key={index}
                    className={`${baseClasses}${dragClasses} ${highlightClasses}`.trim()}
                    draggable={reorderEnabled}
                    onDragStart={handleDragStart(index)}
                    onDragEnter={handleDragEnter(index)}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop(index)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {reorderEnabled && (
                          <span className="mr-2 text-xs font-semibold text-muted-500 dark:text-muted-300 select-none">
                            {index + 1}.
                          </span>
                        )}
                        {file.filename}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="ml-4 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 hover:scale-110"
                      onClick={() => removeFile(index)}
                      title={t('removeFile')}
                    >
                      ×
                    </button>
                  </div>
                );
              })}

              {isImageReorderMode() && (
                <p className="text-xs text-muted-600 dark:text-muted-400 text-center">
                  {t('dragToReorder')}
                </p>
              )}

              {(activeTab === 'merge' || (activeTab === 'convert' && isImageReorderMode())) && (
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-muted-300 dark:border-gray-600 rounded-xl text-muted-600 dark:text-muted-400 hover:border-muted-400 dark:hover:border-gray-500 hover:text-muted-700 dark:hover:text-muted-300 transition-colors"
                  onClick={addMoreFiles}
                >
                  <span className="text-xl font-bold">+</span>
                  {t('addMoreFiles')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="card space-y-6">
        {useCustomCommand ? (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              {t('customCommand')}
            </label>
            <input
              type="text"
              value={customCommand}
              onChange={(e) => setCustomCommand(e.target.value)}
              placeholder={t('customCommandPlaceholder')}
              className="input font-mono text-sm"
            />
            <p className="text-xs text-muted-600 dark:text-muted-400">
              {t('customCommandHelp')}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {(activeTab === 'compress' || activeTab === 'merge') && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  {t('pdfQualitySetting')}
                </label>
                <select
                  value={pdfSetting}
                  onChange={(e) => setPdfSetting(e.target.value)}
                  className="input"
                >
                  {Object.entries(PDF_SETTINGS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            )}

            {activeTab === 'split' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  {t('pageRange')}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    placeholder={t('startPage')}
                    value={splitRange.startPage}
                    onChange={(e) => setSplitRange(prev => ({ ...prev, startPage: e.target.value }))}
                    min="1"
                    className="input flex-1"
                  />
                  <span className="text-muted-600 dark:text-muted-400 font-medium">{t('to')}</span>
                  <input
                    type="number"
                    placeholder={t('endPage')}
                    value={splitRange.endPage}
                    onChange={(e) => setSplitRange(prev => ({ ...prev, endPage: e.target.value }))}
                    min="1"
                    className="input flex-1"
                  />
                </div>
              </div>
            )}

            {/* Show Terminal Output Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showTerminalOutput"
                checked={showTerminalOutput}
                onChange={(e) => setShowTerminalOutput(e.target.checked)}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
              />
              <label htmlFor="showTerminalOutput" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                {t('showTerminalOutput')}
              </label>
            </div>

            {/* Show Progress Bar Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showProgressBar"
                checked={showProgressBar}
                onChange={(e) => setShowProgressBar(e.target.checked)}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
              />
              <label htmlFor="showProgressBar" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                {t('showProgressBar')}
              </label>
            </div>

            {/* Advanced Settings Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="useAdvancedSettings"
                checked={useAdvancedSettings}
                onChange={(e) => setUseAdvancedSettings(e.target.checked)}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
              />
              <label htmlFor="useAdvancedSettings" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                {t('useAdvancedSettings')}
              </label>
            </div>

            {/* Page Selection for PDF to Image Conversion */}
            {activeTab === 'convert' && convertFormat && ['jpg', 'jpeg', 'png', 'bmp'].includes(convertFormat) && files.length > 0 && isPdfFile(files[0]?.file) && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  {pdfPageCount > 0 ? `${t('selectPages')} (1-${pdfPageCount})` : t('pageSelectionLoading')}
                </label>
                <input
                  type="text"
                  placeholder={t('pageSelectionHint')}
                  value={selectedPages}
                  onChange={(e) => setSelectedPages(e.target.value)}
                  className="input"
                  disabled={pdfPageCount === 0}
                />
                <p className="text-xs text-muted-600 dark:text-muted-400">
                  {t('pageSelectionHelp')}
                </p>
              </div>
            )}

            {/* Advanced Settings Panel */}
            {useAdvancedSettings && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="downsampleImages"
                    checked={advancedSettings.colorImageSettings.downsample}
                    onChange={(e) => setAdvancedSettings(prev => ({
                      ...prev,
                      colorImageSettings: {
                        ...prev.colorImageSettings,
                        downsample: e.target.checked
                      }
                    }))}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                  />
                  <label htmlFor="downsampleImages" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                    {t('downsampleImages')}
                  </label>
                </div>

                {advancedSettings.colorImageSettings.downsample && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      {t('colorImageResolution')}
                    </label>
                    <input
                      type="number"
                      value={advancedSettings.colorImageSettings.resolution}
                      onChange={(e) => setAdvancedSettings(prev => ({
                        ...prev,
                        colorImageSettings: {
                          ...prev.colorImageSettings,
                          resolution: parseInt(e.target.value) || 300
                        }
                      }))}
                      min="72"
                      max="1200"
                      className="input sm:w-32"
                    />
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted-50 to-muted-100 dark:from-gray-900 dark:to-gray-800">
      {/* Responsive Navbar Header */}
      <header className="w-full bg-white dark:bg-gray-900 shadow-soft border-b border-muted-200 dark:border-gray-800">
        <nav className="container mx-auto max-w-4xl px-4 py-4 flex flex-row items-center justify-between">
          {/* Left: Page Title + Top Menu */}
          <div className="flex items-center h-full">
            <img
              src="/web-local-pdf-tools/pdf-file.svg"
              alt="PDF Icon"
              className="w-8 h-8 md:w-10 md:h-10 mr-3"
              style={{ display: 'inline-block', verticalAlign: 'middle' }}
            />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white whitespace-nowrap inline-block align-middle">
              {t('title')}
            </h1>
            {/* Top bar menu */}
            <div className="ml-6 flex items-center gap-2">
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'split' ? 'bg-primary-600 text-white shadow-soft' : 'text-muted-600 dark:text-muted-400 hover:text-gray-900 dark:hover:text-white hover:bg-muted-100 dark:hover:bg-gray-800'}`}
                onClick={() => {
                  if (activeTab !== 'split') {
                    setActiveTab('split');
                    resetForm();
                  }
                }}
                title={t('split')}
              >
                {t('split')}
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'merge' ? 'bg-primary-600 text-white shadow-soft' : 'text-muted-600 dark:text-muted-400 hover:text-gray-900 dark:hover:text-white hover:bg-muted-100 dark:hover:bg-gray-800'}`}
                onClick={() => {
                  if (activeTab !== 'merge') {
                    setActiveTab('merge');
                    resetForm();
                  }
                }}
                title={t('merge')}
              >
                {t('merge')}
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'compress' ? 'bg-primary-600 text-white shadow-soft' : 'text-muted-600 dark:text-muted-400 hover:text-gray-900 dark:hover:text-white hover:bg-muted-100 dark:hover:bg-gray-800'}`}
                onClick={() => {
                  if (activeTab !== 'compress') {
                    setActiveTab('compress');
                    resetForm();
                  }
                }}
                title={t('compress')}
              >
                {t('compress')}
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'parse' ? 'bg-primary-600 text-white shadow-soft' : 'text-muted-600 dark:text-muted-400 hover:text-gray-900 dark:hover:text-white hover:bg-muted-100 dark:hover:bg-gray-800'}`}
                onClick={() => {
                  if (activeTab !== 'parse') {
                    setActiveTab('parse');
                    resetForm();
                  }
                }}
                title={t('parse')}
              >
                {t('parse')}
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'convert' ? 'bg-primary-600 text-white shadow-soft' : 'text-muted-600 dark:text-muted-400 hover:text-gray-900 dark:hover:text-white hover:bg-muted-100 dark:hover:bg-gray-800'}`}
                onClick={() => {
                  if (activeTab !== 'convert') {
                    setActiveTab('convert');
                    resetForm();
                  }
                }}
                title={t('convert')}
              >
                {t('convert')}
              </button>
            </div>
          </div>
          {/* Right: Buttons */}
          <div className="flex items-center h-full">
            <RightButtonBar />
            {/* Add more right-side buttons here if needed */}
          </div>
        </nav>
      </header>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Info below navbar */}
        <div className="text-center mb-12">
          <p 
            className="text-lg text-muted-600 dark:text-muted-300 max-w-2xl mx-auto"
            dangerouslySetInnerHTML={{
              __html: t('subtitle')
            }}
          />
        </div>

        {/* Tabs removed per specification: switching via top bar menu only */}

        {/* Tab Content */}
        <div className="card mb-8">
          {activeTab === 'compress' && (
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('compress')} PDF</h3>
              <p className="text-muted-600 dark:text-muted-300">{t('compressDesc')}</p>
            </div>
          )}
          {activeTab === 'merge' && (
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('merge')} PDFs</h3>
              <p className="text-muted-600 dark:text-muted-300">{t('mergeDesc')}</p>
            </div>
          )}
          {activeTab === 'split' && (
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('split')} PDF</h3>
              <p className="text-muted-600 dark:text-muted-300">{t('splitDesc')}</p>
            </div>
          )}
          {activeTab === 'parse' && (
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('parse')} PDF</h3>
              <p className="text-muted-600 dark:text-muted-300">{t('parseDesc')}</p>
            </div>
          )}
          {activeTab === 'convert' && (
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('convert')} File</h3>
              <p className="text-muted-600 dark:text-muted-300">{t('convertDesc')}</p>
            </div>
          )}
        </div>

        {state !== "loading" && state !== "toBeDownloaded" && state !== "error" && (
          <form onSubmit={onSubmit} className="space-y-8">
            {renderFileInput()}
        
        {files.length > 0 && state === "selected" && activeTab === 'convert' && (
          <div className="card mt-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-900 dark:text-white">
                {t('convertTo')}
              </label>
              <select
                value={convertFormat}
                onChange={(e) => setConvertFormat(e.target.value)}
                className="input"
                disabled={supportedFormats.length === 0}
              >
                <option value="">选择格式</option>
                {supportedFormats.map(format => (
                  <option key={format.value} value={format.value}>{format.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        {renderSettings()}

        {state === "selected" && (
          <div className="text-center">
            <button
              type="submit"
              className="btn-primary text-lg px-8 py-4 rounded-xl"
              disabled={activeTab === 'convert' && !convertFormat}
            >
              {activeTab === 'compress' && t('compressPdf')}
              {activeTab === 'merge' && t('mergePdfs')}
              {activeTab === 'split' && t('splitPdf')}
              {activeTab === 'parse' && t('parsePdf')}
              {activeTab === 'convert' && t('convertFile')}
            </button>
          </div>
        )}
          </form>
        )}

        {state === "loading" && (
          <div className="card text-center space-y-4">
            <div className="text-2xl mb-4 animate-spin-slow">🔄</div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {t('processing', { count: activeTab === 'merge' ? 's' : '' })}
            </p>

            {/* Progress Bar */}
            {showProgressBar && (progressInfo.total > 0 || progressInfo.currentPage > 0) && (
              <>
                {progressInfo.total > 0 ? (
                  <>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-2">
                      <div
                        className="bg-primary-600 h-3 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${(progressInfo.current / progressInfo.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-600 dark:text-muted-400">
                      <span>{t('percentComplete', { percent: Math.round((progressInfo.current / progressInfo.total) * 100) })}</span>
                      <span>{t('pagesProgress', { current: progressInfo.current, total: progressInfo.total })}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-2">
                    <div className="animate-pulse text-sm text-muted-600 dark:text-muted-400">
                      {t('processingPage', { page: progressInfo.currentPage })}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Terminal Output Display */}
            {showTerminalOutput && (
              <div ref={terminalRef} className="bg-black dark:bg-gray-900 rounded-lg p-3 max-h-32 overflow-y-auto">
                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-words">
                  {terminalData || t('initializing')}
                </pre>
              </div>
            )}
          </div>
        )}

        {state === "error" && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <p className="text-lg font-semibold mb-2">{t('errorOccurred')}</p>
              <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 rounded-xl p-4 text-left">
                <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap break-words font-mono">
                  {errorMessage}
                </pre>
              </div>
            </div>
            <button onClick={resetForm} className="btn-danger">
              {t('tryAgain')}
            </button>
          </div>
        )}

        {state === "parsed" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: PDF Preview */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{t('pdfPreview')}</h4>
              </div>
              <div ref={previewContainerRef} className="border border-muted-200 dark:border-gray-700 rounded-xl overflow-hidden relative">
                <canvas ref={canvasRef} className="w-full bg-white dark:bg-gray-900"></canvas>
                <div
                  ref={textLayerRef}
                  className="absolute left-0 top-0 w-full h-full"
                  onMouseUp={handleLeftSelection}
                />
              </div>
            </div>

            {/* Right: Extracted Text */}
            <div className="card space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{t('extractedText')}</h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-secondary px-4 py-2 rounded-xl"
                    onClick={() => navigator.clipboard.writeText(parsedPages.join('\n\n'))}
                  >
                    {t('copyAll')}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary px-4 py-2 rounded-xl"
                    onClick={() => {
                      const blob = new Blob([parsedPages.join('\n\n')], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = (files[0]?.filename || 'output.pdf').replace(/\.pdf$/i, '') + '.txt';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    {t('exportTxt')}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="btn-secondary px-4 py-2 rounded-xl"
                  onClick={() => setCurrentParsedPage(prev => Math.max(1, prev - 1))}
                  disabled={currentParsedPage <= 1}
                >
                  {t('prev')}
                </button>
                <span className="text-sm text-muted-600 dark:text-muted-400">
                  {t('page')} {currentParsedPage} / {parsedPages.length}
                </span>
                <button
                  type="button"
                  className="btn-secondary px-4 py-2 rounded-xl"
                  onClick={() => setCurrentParsedPage(prev => Math.min(parsedPages.length, prev + 1))}
                  disabled={currentParsedPage >= parsedPages.length}
                >
                  {t('next')}
                </button>
              </div>

              <div
                ref={rightTextRef}
                onMouseUp={handleRightSelection}
                className="bg-muted-50 dark:bg-gray-700 border border-muted-200 dark:border-gray-600 rounded-xl p-4 text-sm whitespace-pre-wrap break-words text-gray-900 dark:text-white"
              >
                {(parsedPageItems[currentParsedPage - 1] || []).length > 0 ? (
                  (parsedPageItems[currentParsedPage - 1] || []).map((item, idx) => (
                    <span key={idx} data-index={idx}>
                      {item.str + ' '}
                    </span>
                  ))
                ) : (
                  <pre className="text-sm whitespace-pre-wrap break-words">{parsedPages[currentParsedPage - 1] || ''}</pre>
                )}
              </div>

              <div className="text-center">
                <button
                  type="button"
                  className="btn-secondary text-lg px-8 py-4 rounded-xl"
                  onClick={() => navigator.clipboard.writeText(parsedPages[currentParsedPage - 1] || '')}
                >
                  {t('copyPage')}
                </button>
              </div>
            </div>
          </div>
        )}

        {state === "toBeDownloaded" && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
              {t('conversionComplete')}
            </h3>
            
            {/* Action buttons at the top */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={processAgain} className="btn-secondary text-lg px-8 py-4 rounded-xl">
                {t('processAgain')}
              </button>
              <button onClick={() => {
                resetForm();
                // Trigger file selection dialog after a short delay to ensure form is reset
                setTimeout(() => {
                  document.getElementById('files').click();
                }, 100);
              }} className="btn-primary text-lg px-8 py-4 rounded-xl">
                {t('chooseNewFiles')}
              </button>
            </div>
            
            {/* File previews below */}
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
                  {/* Preview Section - Full width container */}
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
                            <PdfPreview url={link.url} />
                          </div>
                        ) : null}
                        
                        {/* Fallback for failed preview */}
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
                  
                  {/* Download Section */}
                  <div className="flex flex-col gap-3 md:w-auto w-full">
                    <a
                      href={link.url}
                      download={link.filename}
                      className="btn-success text-lg px-6 py-3 rounded-xl text-center whitespace-nowrap"
                    >
                      {t('download', { filename: link.filename })}
                    </a>
                    
                    {/* Preview button for images and PDFs */}
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
