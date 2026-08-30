import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Header
      "title": "Local PDF Tools",
      "subtitle": "Compress, merge, split, parse and convert PDF files locally in your browser. No uploads required - everything stays on your device.",
      
      // Tabs
      "compress": "Compress",
      "merge": "Merge", 
      "split": "Split",
      "organize": "Organize",
      "parse": "Parse",
      "convert": "Convert",
      
      // Tab descriptions
      "compressDesc": "Reduce PDF file size while maintaining quality.",
      "mergeDesc": "Combine multiple PDF files into a single document.",
      "splitDesc": "Extract specific page ranges from a PDF document.",
      "organizeDesc": "Rotate, delete, reorder and extract pages visually.",
      "parseDesc": "Extract text from PDF pages for copy or export.",
      "convertDesc": "Convert PDF files to images or images to PDF.",

      // Organize tool
      "organizeApply": "Apply changes",
      "organizeExtract": "Extract selected pages",
      "organizeRotate": "Rotate 90°",
      "organizeDelete": "Delete selected",
      "organizeInsertBlank": "Insert blank page",
      "organizeReset": "Reset changes",
      "selectAll": "Select all",
      "invertSelection": "Invert",
      "selectedPagesCount": "{{selected}} / {{total}} pages selected",
      "deletedPagesCount": "{{count}} page(s) will be deleted",
      "keepAtLeastOnePage": "Keep at least one page",
      "blankPage": "Blank",
      "deletedPageUndo": "Deleted - click to restore",
      "organizeGridHint": "Click to select · drag to reorder · hover a page for actions",
      "changeFile": "Change file",
      "repairMode": "Repair mode (rewrite file structure, no compression)",
      
      // File input
      "chooseFiles": "Choose PDF file{{count}} to {{operation}}",
      "filesSelected": "{{count}} file{{count}} selected",
      "clearAll": "Clear All",
      "addMoreFiles": "Add more files",
      "removeFile": "Remove file",
      "pages": "{{count}} pages",
      "dropFilesAnywhere": "Drop to add files",
      "selectFileFirst": "Select a file to enable processing",
      
      // Settings
      "pdfQualitySetting": "PDF Quality Setting:",
      "pageRange": "Page Range:",
      "startPage": "Start page",
      "endPage": "End page",
      "to": "to",
      "showTerminalOutput": "Show terminal output",
      "showProgressBar": "Show progress bar",
      "useAdvancedSettings": "Use advanced settings",
      
      // PDF Settings
      "originalQuality": "Keep original quality (no re-compression)",
      "qualityOriginalShort": "Original",
      "qualityScreenShort": "Screen",
      "qualityEbookShort": "eBook",
      "qualityPrinterShort": "Printer",
      "qualityPrepressShort": "Prepress",
      "qualityDefaultShort": "Default",
      "advancedOptions": "Advanced options",
      "screenOptimized": "Screen-optimized (smallest)",
      "ebook": "eBook (small)",
      "printer": "Printer (balanced)",
      "prepress": "Prepress (high quality)",
      "default": "Default (original quality)",
      "useCustomCommand": "Use custom Ghostscript command",
      "customCommand": "Custom Ghostscript command:",
      "customCommandPlaceholder": "-sDEVICE=pdfwrite -sOutputFile=output.pdf input.pdf",
      "customCommandHelp": "Input files are written to the virtual filesystem as input.pdf (merge: input0.pdf, input1.pdf, ...). Your command must include -sDEVICE=, write the result to output.pdf, and reference the input files. Example: -sDEVICE=pdfwrite -dPDFSETTINGS=/printer -sOutputFile=output.pdf input.pdf",
      
      // Advanced Settings
      "advancedPdfSettings": "Advanced PDF Settings",
      "essentialSettings": "Essential Settings",
      "pdfCompatibilityLevel": "PDF Compatibility Level:",
      "downsampleImages": "Downsample color images",
      "colorImageResolution": "Color Image Resolution (DPI):",
      
      // Buttons
      "compressPdf": "Compress PDF",
      "mergePdfs": "Merge PDFs", 
      "splitPdf": "Split PDF",
      "parsePdf": "Parse PDF",
      "convertFile": "Convert File",
      "processAgain": "Process Again",
      "chooseNewFiles": "Choose New Files",
      "tryAgain": "Try Again",
      "download": "Download {{filename}}",
      "parsedResults": "Parsed Results",
      "pdfPreview": "PDF Preview",
      "extractedText": "Extracted Text",
      "page": "Page",
      "prev": "Previous",
      "next": "Next",
      "copyPage": "Copy Page Text",
      "copyAll": "Copy All Text",
      "exportTxt": "Export to TXT",
      
      // Processing states
      "processing": "Processing your PDF{{count}}...",
      "processingProgress": "Processing Progress",
      "terminalOutput": "Terminal Output",
      "liveOutput": "Live Output", 
      "initializing": "Initializing...",
      "processingPage": "Processing page {{page}}...",
      "pageOf": "Page {{current}} of {{total}}",
      "percentComplete": "{{percent}}% Complete",
      "pagesProgress": "{{current}}/{{total}} pages",
      "conversionComplete": "Conversion Complete",
      "preview": "Preview",
      "previewNotAvailable": "Preview not available",
      "noPdfPreview": "No PDF available for preview",
      "loadingPdf": "Loading PDF...",
      "rendering": "Rendering...",
      "pdfLoadFailed": "Failed to load PDF",
      "pdfRenderFailed": "Failed to render PDF page",
      "progressBar": "Progress bar",
      "switchToLight": "Switch to light mode",
      "switchToDark": "Switch to dark mode",
      
      // Error messages
      "errorOccurred": "An error occurred while processing your PDF:",
      "selectAtLeastTwoFiles": "Please select at least 2 PDF files to merge.",
      "specifyPageRange": "Please specify page range for splitting.",
      "validPageNumbers": "Please enter valid page numbers. End page must be greater than or equal to start page.",
      "enterCustomCommand": "Please enter a custom command or disable custom command mode.",
      "customCommandRequired": "Custom command must include -sDEVICE= and -sOutputFile= parameters.",
      "pageRangeExceedsPages": "End page exceeds the document ({{count}} pages total).",
      "onlyFirstFileUsed": "This operation processes a single file; the other {{count}} file(s) were ignored.",
      "pdfPasswordProtected": "This PDF is password-protected. Please remove the password (e.g. re-save or print it to a new PDF) and try again.",

      // Output size feedback
      "outputSize": "File size: {{size}}",
      "sizeSmaller": "{{before}} → {{after}} ({{percent}}% smaller)",
      "sizeLarger": "{{before}} → {{after}} ({{percent}}% larger)",
      
      // Features section
      "features": "Features",
      "compressFeature": "Reduce file size with quality presets or custom settings",
      "mergeFeature": "Combine multiple PDFs into one document", 
      "splitFeature": "Extract specific page ranges from a PDF",
      "parseFeature": "Extract text content from PDFs, with copy and export options",
      "convertFeature": "Convert PDFs to JPG, PNG, JPEG or BMP images, and images to PDF",
      // Convert feature
      "selectFileToConvert": "Select a file to convert",
      "convertTo": "Convert to:",
  "selectPages": "Select pages",
  "pageSelectionHint": "Example: 1,3-5,10",
  "pageSelectionHelp": "Use commas to separate pages or ranges, e.g. 1,3-5",
  "pageSelectionLoading": "Loading page list...",
      "progressBarFeature": "Visual progress tracking with page-by-page processing status",
  "dragToReorder": "Drag files to adjust their order",
  "invalidPageSelection": "Please enter page numbers that exist in the document.",
  "mixedConvertTypesNotSupported": "Please select either a PDF or image files, not both at the same time.",
  "multiplePdfsNotSupported": "Please select only one PDF file for conversion to images.",
  "unsupportedConvertType": "Unsupported file type selected for conversion.",
      
      // Privacy section
      "privacySecurity": "Privacy & Security:",
      "privacyText": "All processing happens locally in your browser. No files are uploaded to any server.",
      "viewSourceCode": "View source code on GitHub",
      
      // Footer
      "copyright": "© {{year}} Local PDF Tools. Code licensed under AGPLv3.",
      "sponsor": "Sponsor",
      
      // Language
      "language": "Language",
      "english": "English", 
      "chinese": "简体中文",

      // UI theme switcher
      "uiTheme": "UI style",
      "themeBentoDesc": "Clean modular cards",
      "themeAuroraDesc": "Glass & aurora glow",
      "themeSwissDesc": "Typographic grid",
      "themeBrutalismDesc": "Bold & raw",
      "themeTerminalDesc": "Phosphor console",
      "dropHere": "or drag & drop files here"
    }
  },
  zh: {
    translation: {
      // Header
      "title": "本地 PDF 工具",
      "subtitle": "在浏览器中本地压缩、合并、拆分、解析和转换 PDF 文件。无需上传 - 一切都保留在您的设备上。",
      
      // Tabs
      "compress": "压缩",
      "merge": "合并",
      "split": "拆分",
      "organize": "整理页面",
      "parse": "解析",
      "convert": "文件转换",
      
      // Tab descriptions  
      "compressDesc": "在保持质量的同时减小 PDF 文件大小。",
      "mergeDesc": "将多个 PDF 文件合并为单个文档。",
      "splitDesc": "从 PDF 文档中提取特定页面范围。",
      "organizeDesc": "可视化旋转、删除、重排和提取 PDF 页面。",
      "parseDesc": "提取 PDF 各页的文本，支持复制与导出。",
      "convertDesc": "将 PDF 文件转换为图片或将图片转换为 PDF。",

      // Organize tool
      "organizeApply": "应用更改",
      "organizeExtract": "提取选中页",
      "organizeRotate": "旋转 90°",
      "organizeDelete": "删除选中",
      "organizeInsertBlank": "插入空白页",
      "organizeReset": "重置更改",
      "selectAll": "全选",
      "invertSelection": "反选",
      "selectedPagesCount": "已选 {{selected}} / {{total}} 页",
      "deletedPagesCount": "{{count}} 页将被删除",
      "keepAtLeastOnePage": "至少保留一页",
      "blankPage": "空白",
      "deletedPageUndo": "已删除 - 点击恢复",
      "organizeGridHint": "点击选中 · 拖拽排序 · 悬停页面可旋转/插页",
      "changeFile": "更换文件",
      "repairMode": "修复模式（重写文件结构，不压缩）",
      
      // File input
      "chooseFiles": "选择要{{operation}}的 PDF 文件{{count}}",
      "filesSelected": "已选择 {{count}} 个文件{{count}}",
      "clearAll": "清除全部",
      "addMoreFiles": "添加更多文件",
      "removeFile": "移除文件",
      "pages": "{{count}} 页",
      "dropFilesAnywhere": "松手即可添加文件",
      "selectFileFirst": "选择文件后即可开始处理",
      
      // Settings
      "pdfQualitySetting": "PDF 质量设置：",
      "pageRange": "页面范围：",
      "startPage": "起始页",
      "endPage": "结束页", 
      "to": "到",
      "showTerminalOutput": "显示终端输出",
      "showProgressBar": "显示进度条",
      "useAdvancedSettings": "使用高级设置",
      
      // PDF Settings
      "originalQuality": "保持原始质量（不重新压缩）",
      "qualityOriginalShort": "原始",
      "qualityScreenShort": "屏幕",
      "qualityEbookShort": "电子书",
      "qualityPrinterShort": "打印",
      "qualityPrepressShort": "印前",
      "qualityDefaultShort": "默认",
      "advancedOptions": "高级选项",
      "screenOptimized": "屏幕优化（最小）",
      "ebook": "电子书（小）",
      "printer": "打印机（平衡）",
      "prepress": "印前（高质量）",
      "default": "默认（原始质量）",
      "useCustomCommand": "使用自定义 Ghostscript 命令",
      "customCommand": "自定义 Ghostscript 命令：",
      "customCommandPlaceholder": "-sDEVICE=pdfwrite -sOutputFile=output.pdf input.pdf",
      "customCommandHelp": "输入文件会写入虚拟文件系统：input.pdf（合并时为 input0.pdf、input1.pdf……）。命令必须包含 -sDEVICE=，将结果输出到 output.pdf，并引用输入文件。示例：-sDEVICE=pdfwrite -dPDFSETTINGS=/printer -sOutputFile=output.pdf input.pdf",
      
      // Advanced Settings
      "advancedPdfSettings": "高级 PDF 设置",
      "essentialSettings": "基本设置",
      "pdfCompatibilityLevel": "PDF 兼容性级别：",
      "downsampleImages": "降采样彩色图像",
      "colorImageResolution": "彩色图像分辨率（DPI）：",
      
      // Buttons
      "compressPdf": "压缩 PDF",
      "mergePdfs": "合并 PDFs",
      "splitPdf": "拆分 PDF",
      "parsePdf": "解析 PDF",
      "convertFile": "转换文件",
      "processAgain": "重新处理",
      "chooseNewFiles": "选择新文件",
      "tryAgain": "重试",
      "download": "下载 {{filename}}",
      "parsedResults": "解析结果",
      "pdfPreview": "PDF 预览",
      "extractedText": "抽取文本",
      "page": "第",
      "prev": "上一页",
      "next": "下一页",
      "copyPage": "复制当前页文本",
      "copyAll": "复制全部文本",
      "exportTxt": "导出为 TXT",
      
      // Processing states
      "processing": "正在处理您的 PDF{{count}}...",
      "processingProgress": "处理进度",
      "terminalOutput": "终端输出",
      "liveOutput": "实时输出",
      "initializing": "正在初始化...",
      "processingPage": "正在处理第 {{page}} 页...",
      "pageOf": "第 {{current}} 页，共 {{total}} 页",
      "percentComplete": "{{percent}}% 完成",
      "pagesProgress": "{{current}}/{{total}} 页",
      "conversionComplete": "转换完成",
      "preview": "预览",
      "previewNotAvailable": "暂不支持预览该格式",
      "noPdfPreview": "暂无可预览的 PDF",
      "loadingPdf": "正在加载 PDF...",
      "rendering": "渲染中...",
      "pdfLoadFailed": "PDF 加载失败",
      "pdfRenderFailed": "PDF 页面渲染失败",
      "progressBar": "进度条",
      "switchToLight": "切换到亮色模式",
      "switchToDark": "切换到暗色模式",
      
      // Error messages
      "errorOccurred": "处理您的 PDF 时发生错误：",
      "selectAtLeastTwoFiles": "请至少选择 2 个 PDF 文件进行合并。",
      "specifyPageRange": "请指定拆分的页面范围。",
      "validPageNumbers": "请输入有效的页码。结束页必须大于或等于起始页。",
      "enterCustomCommand": "请输入自定义命令或禁用自定义命令模式。",
      "customCommandRequired": "自定义命令必须包含 -sDEVICE= 和 -sOutputFile= 参数。",
      "pageRangeExceedsPages": "结束页超出文档范围（共 {{count}} 页）。",
      "onlyFirstFileUsed": "该操作仅处理单个文件，已忽略其余 {{count}} 个文件。",
      "pdfPasswordProtected": "该 PDF 已加密（需要密码）。请先解除密码（例如重新另存或打印为 PDF）后再试。",

      // Output size feedback
      "outputSize": "文件大小：{{size}}",
      "sizeSmaller": "{{before}} → {{after}}（减小 {{percent}}%）",
      "sizeLarger": "{{before}} → {{after}}（增大 {{percent}}%）",
      
      // Features section
      "features": "功能",
      "compressFeature": "使用质量预设或自定义设置减小文件大小",
      "mergeFeature": "将多个 PDF 合并为一个文档",
      "splitFeature": "从 PDF 中提取特定页面范围",
      "parseFeature": "提取 PDF 文本内容，支持复制与导出",
      "convertFeature": "将 PDF 转换为 JPG、PNG、JPEG 或 BMP 图片，以及将图片转换为 PDF",
      // Convert feature
      "selectFileToConvert": "选择要转换的文件",
      "convertTo": "转换为：",
  "selectPages": "选择页码",
  "pageSelectionHint": "例如：1,3-5,10",
  "pageSelectionHelp": "使用逗号分隔页面或区间，例如 1,3-5",
  "pageSelectionLoading": "正在读取页码...",
      "progressBarFeature": "带有逐页处理状态的可视化进度跟踪",
  "dragToReorder": "拖动文件可调整顺序",
  "invalidPageSelection": "请输入文档范围内的有效页码。",
  "mixedConvertTypesNotSupported": "请选择单个 PDF 或一组图片，不能同时选择两种类型。",
  "multiplePdfsNotSupported": "PDF转图片时只能选择一个PDF文件，不能选择多个PDF文件。",
  "unsupportedConvertType": "包含不支持转换的文件类型。",
      
      // Privacy section
      "privacySecurity": "隐私与安全：",
      "privacyText": "所有处理都在您的浏览器中本地进行。不会将任何文件上传到任何服务器。",
      "viewSourceCode": "在 GitHub 上查看源代码",
      
      // Footer
      "copyright": "© {{year}} 本地 PDF 工具。代码采用 AGPLv3 许可。",
      "sponsor": "赞助",
      
      // Language
      "language": "语言",
      "english": "English",
      "chinese": "简体中文",

      // UI theme switcher
      "uiTheme": "界面风格",
      "themeBentoDesc": "干净的模块化卡片",
      "themeAuroraDesc": "玻璃质感与极光渐变",
      "themeSwissDesc": "瑞士排版网格",
      "themeBrutalismDesc": "粗犷醒目的新粗野主义",
      "themeTerminalDesc": "荧光终端控制台",
      "dropHere": "或拖拽文件到此处"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;