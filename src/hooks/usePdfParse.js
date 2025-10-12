import { useState, useRef } from 'react';

/**
 * @description PDF 解析与预览状态管理
 * @returns {object} 包含 PDF 解析与预览相关的状态、引用和更新函数的对象
 */
export const usePdfParse = () => {
  const [parsedPages, setParsedPages] = useState([]);
  const [currentParsedPage, setCurrentParsedPage] = useState(1);
  const pdfDocRef = useRef(null);
  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const previewContainerRef = useRef(null);
  const rightTextRef = useRef(null);
  const [parsedPageItems, setParsedPageItems] = useState([]);
  const [highlightMap, setHighlightMap] = useState({});

  return {
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
  };
};