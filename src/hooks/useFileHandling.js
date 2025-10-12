import { useState, useRef } from 'react';
import { reorderFiles } from '../utils/pdf';

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
export const useFileHandling = ({ setState, setFiles, setSupportedFormats, setConvertFormat, setSelectedPages, setPdfPageCount }) => {
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragSourceIndexRef = useRef(null);

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
        setSupportedFormats([]);
        setConvertFormat('');
        setSelectedPages('');
        setPdfPageCount(0);
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
    setSupportedFormats([]);
    setConvertFormat('');
    setSelectedPages('');
    setPdfPageCount(0);
    setDraggingIndex(null);
    setDragOverIndex(null);
    dragSourceIndexRef.current = null;
  };

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
  };
};