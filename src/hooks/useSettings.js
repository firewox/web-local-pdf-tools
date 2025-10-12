import { useState } from 'react';

/**
 * @description 设置状态管理
 * @returns {object} 包含设置状态和更新函数的对象
 */
export const useSettings = () => {
  const [pdfSetting, setPdfSetting] = useState('/ebook');
  const [customCommand, setCustomCommand] = useState('');
  const [useCustomCommand, setUseCustomCommand] = useState(false);
  const [splitRange, setSplitRange] = useState({ startPage: '', endPage: '' });
  const [advancedSettings, setAdvancedSettings] = useState({
    compatibilityLevel: '1.4',
    colorImageSettings: {
      downsample: true,
      resolution: 300,
    },
  });
  const [useAdvancedSettings, setUseAdvancedSettings] = useState(false);
  const [convertFormat, setConvertFormat] = useState('');
  const [supportedFormats, setSupportedFormats] = useState([]);
  const [selectedPages, setSelectedPages] = useState('');
  const [pdfPageCount, setPdfPageCount] = useState(0);

  return {
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
  };
};