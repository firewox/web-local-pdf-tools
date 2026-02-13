import { useState } from 'react';

/**
 * @description App 状态管理
 * @returns {object} 包含 App 状态和更新函数的对象
 */
export const useAppState = () => {
  const [activeTab, setActiveTab] = useState('compress');
  const [state, setState] = useState('init');
  const [files, setFiles] = useState([]);
  const [downloadLinks, setDownloadLinks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [showTerminalOutput, setShowTerminalOutput] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [terminalData, setTerminalData] = useState('');
  const [progressInfo, setProgressInfo] = useState({
    current: 0,
    total: 0,
    currentPage: 0,
  });

  const [pdfUrl, setPdfUrl] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);

  return {
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
    setPdfUrl,
    fileInfo,
    setFileInfo,
  };
};