# Agents

This document defines the AI agents and their roles within the **web-local-pdf-tools** project.

## 🤖 Agent Roles

### 1. Primary Developer
- **Role**: Senior Pair Programmer
- **Responsibilities**:
  - Implement new features
  - Refactor code
  - Fix bugs
  - Ensure code quality and consistency
- **Tools**: Trae IDE, SearchCodebase, Read, Write, etc.

## 📝 Guidelines

1. **Code Style**: Follow the existing coding conventions (React, functional components, custom hooks).
2. **Commit Messages**: Follow the project's Git commit norms (e.g., `Feat: ...`, `Fix: ...`).
3. **Language**: Communication in Chinese, Code/Commits in English.

## 🔄 Workflow

1. Receive user instruction.
2. Analyze requirements.
3. Plan and execute changes.
4. Verify changes.

---

# Web Local PDF Tools - 开发文档

## 📋 项目概述

**项目名称**：Web Local PDF Tools
**项目定位**：基于浏览器的本地 PDF 处理工具
**开发语言**：JavaScript / JSX
**许可证**：GNU Affero General Public License v3.0 (AGPL-3.0)
**在线演示**：[待部署](https://firewox.github.io/web-local-pdf-tools/)

### 核心理念

这是一款完全运行在浏览器中的 PDF 处理工具，追求轻量、优雅、安全的用户体验。所有 PDF 处理操作均在客户端本地执行（Ghostscript WASM / PDF.js / jsPDF），确保用户文档数据的绝对安全性，无需上传到任何服务器。

告别传统 PDF 软件（WPS、Microsoft Office、Adobe Acrobat）的繁琐和臃肿，不需要安装，不强制订阅，没有弹窗干扰。

仓库另带一个可选的本地静态服务器（`server.cjs`，Express），用于本地托管构建产物，并可打包为 Windows 单文件 exe。

---

## 🎯 主要功能

### 1. PDF 压缩（Compress）
- 多种质量预设选项：
  - `/screen` - 屏幕优化（文件最小）
  - `/ebook` - 电子书质量（较小，默认）
  - `/printer` - 打印机质量（平衡）
  - `/prepress` - 印前质量（高质量）
  - `/default` - 默认（原始质量）
- 自定义 Ghostscript 命令（勾选"使用自定义 Ghostscript 命令"后可用，适用于压缩/合并/拆分；需包含 `-sDEVICE=`，输出到 `output.pdf` 并引用 `input.pdf`，合并时输入文件为 `input0.pdf`、`input1.pdf`…，由 `parseCommandArgs` 做引号感知解析）
- 高级设置：PDF 兼容性级别（默认 1.4）、彩色图像降采样开关与分辨率（DPI）

### 2. PDF 合并（Merge）
- **页面级合并工作台**：所有来源 PDF 的页面按合并顺序铺成网格，支持页级拖拽排序（可交错不同文件的页面）、点开大图预览（预览内可旋转）、悬停单页旋转
- **来源颜色分组**：每个来源 PDF 分配专属颜色（左边框 + 色点 + 来源页码标签），顶部彩色 chips 显示各来源文档（名称/页数/单个移除）
- 输出用 pdf-lib 无损重组（`copyPages` + `setRotation`，连续同源页批量复制）——不经过 Ghostscript，不再提供重压缩；需要压缩请合并后走压缩工具
- 支持追加文件、单个移除来源、重置更改；加密 PDF 走友好提示

### 3. PDF 分割（Split）
- 按页码范围提取 PDF 页面（`-dFirstPage` / `-dLastPage`）
- 简单的起始页/结束页指定，提交前做整数与范围校验
- 保持原始质量

### 4. PDF 解析（Parse）
- 提取 PDF 文档中的文本内容（PDF.js `getTextContent`）
- 左侧 PDF 页面 Canvas 预览 + 透明文本层，右侧纯文本显示
- 文本选择高亮双向同步（左图选中文本 ↔ 右侧文本面板）
- 支持逐页预览和导航
- 支持复制单页或全部文本，导出为 TXT 文件

### 5. 页面工作台（Organize）
- 可视化页面网格：点选多页、拖拽排序、悬停单页旋转/插页
- 批量操作：全选/反选、旋转 90°、删除（幻影格可点击恢复）、插入空白页（A4）
- 「提取选中页」直接导出新 PDF；「应用更改」按当前状态无损重建（pdf-lib `copyPages` + `setRotation`，不经 Ghostscript 重编码）
- 所有编辑为前端状态，可随时「重置更改」；缩略图懒渲染（IntersectionObserver，大 PDF 不卡）
- **修复模式**：压缩 tab 高级选项中的复选框，跳过质量预设用 pdfwrite 重写文件结构，抢救损坏 PDF

### 6. PDF/图片 转换（Convert）
- **PDF → 图片**：将 PDF 按页渲染为 JPG / JPEG / PNG / BMP（Canvas 2 倍分辨率渲染），支持页码范围选择（如 `1,3-5`），逐页生成下载项并带预览
- **图片 → PDF**：将多张图片（JPG/PNG/BMP）合成为 PDF（jsPDF，A4 纸张），按首张图片方向自动横/竖版，图片居中缩放，支持拖拽排序

### 7. 通用功能
- **多 UI 主题**：6 套工具卡（含整理页面）+ 5 套可切换设计风格 —— Bento Grid（默认）、Aurora Glass、Swiss Type、Neo-Brutalism、Terminal
- **暗黑模式**：亮色/暗色主题切换，首次访问自动识别系统偏好
- **多语言支持**：英文、简体中文（localStorage 持久化）
- **拖放上传**：文件选择区支持拖放文件
- **进度显示**：可视化进度条 + 终端输出显示 + 页面级处理进度跟踪

---

## 🏗️ 技术架构

### 技术栈

| 技术/库 | 版本 | 用途 |
|--------|------|------|
| React | 18.2.0 | 前端框架 |
| React DOM | 18.2.0 | DOM 渲染 |
| Vite | 7.1.3 | 构建工具 |
| TailwindCSS | 3.4.17 | CSS 框架（语义化 token + CSS 变量） |
| PostCSS / Autoprefixer | 8.5.6 | CSS 处理 |
| pdfjs-dist | 5.4.149 | PDF 渲染和文本提取 |
| jspdf | 3.0.3 | 图片转 PDF |
| i18next / react-i18next | 23.7.6 / 13.5.0 | 国际化 |
| Ghostscript WASM | - | PDF 压缩/合并/分割引擎 |
| Express + morgan | 4.19.2 / 1.10.0 | 本地静态服务器（server.cjs） |
| pkg | 5.8.1 | 打包 Windows exe |

### 项目结构

```
web-local-pdf-tools/
├── .github/                     # GitHub 配置（工作流等）
├── public/
│   └── pdf-file.svg             # 应用图标
├── src/                         # 源代码
│   ├── App.jsx                  # 主应用（组合层：装配 hooks 与组件）
│   ├── main.jsx                 # 应用入口
│   ├── index.css                # 全局样式 + 5 套主题的 CSS 变量定义
│   ├── components/
│   │   ├── RightButtonBar.jsx   # 右上按钮组（主题切换、语言、GitHub、暗黑模式）
│   │   ├── common/              # HeaderNav（顶部导航标签）、ThemeSwitcher（主题下拉）、
│   │   │                        # OperationIntro、PageSubtitle、ProgressBar、TerminalOutput、ActionSubmit
│   │   ├── file/FileSelector.jsx    # 拖放上传区 + 文件列表 + 拖拽排序
│   │   ├── pdf/PdfPreview.jsx       # 下载前 PDF 预览
│   │   ├── parse/                   # PdfParsePreview（左栏预览）、ParsedTextPanel（右栏文本）
│   │   ├── settings/                # SettingsPanel（各 tab 设置项）、ConvertFormatSelector
│   │   └── state/                   # LoadingPanel、ErrorPanel、DownloadList
│   ├── hooks/
│   │   ├── useAppState.js       # 全局状态机
│   │   ├── useSettings.js       # 设置相关状态
│   │   ├── useFileHandling.js   # 文件选择/拖放/排序/校验
│   │   ├── usePdfOperations.js  # 各操作的业务逻辑与分发
│   │   ├── usePdfParse.js       # 解析视图状态与 refs
│   │   └── useTheme.js          # UI 主题 + 暗黑模式
│   ├── lib/
│   │   ├── worker-init.js       # Web Worker 创建与 Promise 封装（1 小时超时）
│   │   ├── background-worker.js # Ghostscript 参数构建与 WASM 调用
│   │   ├── gs-worker.js         # Emscripten 生成的 Ghostscript 加载器
│   │   ├── gs-worker.wasm       # Ghostscript WebAssembly 二进制
│   │   └── i18n.js              # 国际化配置（en/zh）
│   ├── services/
│   │   ├── pdfService.js        # Worker 调用封装（processWithGS）
│   │   └── imagePdf.js          # jsPDF 图片转 PDF
│   └── utils/
│       └── pdf.js               # 文件类型判断、页码选择解析、列表重排
├── index.html                   # HTML 入口（含主题防闪烁内联脚本）
├── server.cjs                   # Express 本地静态服务器
├── deploy-gh-page.sh            # GitHub Pages 部署脚本
├── vite.config.js / tailwind.config.js / postcss.config.js
├── package.json / README.md / README_CN.md / LICENSE
└── AGENTS.md                    # 开发文档（本文件）
```

---

## 🔧 核心模块详解

### 1. App.jsx - 主应用（组合层）

App.jsx 不再承载业务逻辑，职责是**装配 hooks 与组件**：

- 调用各 hooks 获取状态与处理函数，通过 props 传给子组件
- PDF 解析视图的 Canvas 渲染（`renderPdfPage`：自适应容器宽度、devicePixelRatio 高清渲染、构建透明文本层）与文本高亮同步（`updateLeftHighlights` / `handleLeftSelection` / `handleRightSelection`，基于 `selectionchange` 事件）
- 顶部导航切换 tab 时调用 `resetForm()` 清空状态

**状态机**（`useAppState`）：
- `init` - 初始状态
- `selected` - 文件已选择
- `loading` - 处理中
- `toBeDownloaded` - 处理完成，等待下载
- `parsed` - PDF 解析完成
- `error` - 错误状态

**核心状态**：
```javascript
const [activeTab, setActiveTab] = useState('compress');       // 当前功能标签
const [state, setState] = useState('init');                   // 状态机
const [files, setFiles] = useState([]);                       // 文件列表 {file, filename, size, type, url}
const [downloadLinks, setDownloadLinks] = useState([]);       // 下载链接列表
const [errorMessage, setErrorMessage] = useState('');         // 错误信息
const [showTerminalOutput, setShowTerminalOutput] = useState(false);  // 终端输出开关
const [showProgressBar, setShowProgressBar] = useState(false);        // 进度条开关
const [terminalData, setTerminalData] = useState('');         // 终端文本
const [progressInfo, setProgressInfo] = useState({ current: 0, total: 0, currentPage: 0 });
```

**设置状态**（`useSettings`）：
```javascript
pdfSetting           // '/ebook' 等质量预设
customCommand        // 自定义 Ghostscript 命令
splitRange           // { startPage, endPage }
advancedSettings     // { compatibilityLevel, colorImageSettings: { downsample, resolution } }
convertFormat        // 转换目标格式（jpg/jpeg/png/bmp/pdf）
selectedPages        // 页码选择字符串，如 "1,3-5"
pdfPageCount         // 当前 PDF 页数（用于校验页码范围）
```

### 2. hooks 详解

| Hook | 职责 |
|------|------|
| `useAppState` | 全局状态机与进度/终端状态 |
| `useSettings` | 质量预设、自定义命令、分割范围、高级设置、转换格式 |
| `useFileHandling` | 文件选择（input 与拖放）、逐个增删、清空、拖拽排序（merge 多 PDF 与 convert 多图片时启用）；选择文件时读取 PDF 页数、校验类型并联动转换格式选项 |
| `usePdfOperations` | 业务分发与校验：`onSubmit` → `validateBeforeProcess` → `processPDF`（压缩/合并/分割，走 GS Worker）/ `convertFile`（PDF→图片走 pdfjs Canvas；图片→PDF 走 jsPDF）/ `parsePDF`（pdfjs 文本提取）；另含 `resetForm`（释放 Blob URL）、`processAgain`、输出文件名生成 |
| `usePdfParse` | 解析结果 `parsedPages`/`parsedPageItems`、当前页、各 DOM refs、`highlightMap`（每页高亮的文本项索引集合） |
| `useTheme` | UI 主题（`<html data-ui>`）与暗黑模式（`.dark` class），均持久化到 localStorage |

### 3. 组件结构

- **HeaderNav**：粘性顶栏，logo + 五个功能标签（split/merge/compress/parse/convert）+ 右侧 `RightButtonBar`
- **RightButtonBar**：`ThemeSwitcher`（5 主题下拉，带迷你配色预览）、语言下拉（en/zh）、GitHub 链接、暗黑模式切换
- **FileSelector**：隐藏 input + 拖放上传区（dropzone）；文件列表卡片支持单个移除、全部清空、拖拽排序（带序号与放置高亮）
- **SettingsPanel / ConvertFormatSelector**：按 tab 渲染对应设置项（质量预设、自定义命令、高级设置、页码范围、终端/进度开关、转换目标格式与页码选择）
- **LoadingPanel / ErrorPanel / DownloadList**：三种终态展示；DownloadList 对图片显示预览图、对 PDF 内嵌 `PdfPreview`，并提供下载/新窗口预览按钮
- **PdfParsePreview / ParsedTextPanel**：解析结果双栏视图

### 4. worker-init.js - Worker 初始化器

- 以 ES module 方式创建 `background-worker.js` Worker
- 发送 `{ target: 'wasm', ...dataStruct }`，Promise 封装响应
- `progress` 消息回调用于终端输出/进度条；`result` 消息 resolve 最终结果
- 超时控制：1 小时（`3600000ms`），超时终止 Worker
- 结果返回后自动终止 Worker

### 5. background-worker.js - 后台处理 Worker

**核心函数**：
- `_GSPS2PDF()` - 入口分发：compress 单文件 / merge 转发 `_GSMergePDF` / split 转发 `_GSSplitPDF`
- `_GSMergePDF()` - 多文件合并（并发 XHR 加载全部输入后统一处理）
- `_GSSplitPDF()` - 按页范围分割
- `parseCommandArgs()` - 引号感知的命令行参数解析（自定义命令用）
- `buildAdvancedArgs()` - 注入兼容性级别与图像降采样参数
- `validateArgs()` - 校验必须包含 `-sDEVICE=` 与 `-sOutputFile=`

**Ghostscript 参数构建**（压缩示例）：
```javascript
[
  "-sDEVICE=pdfwrite",
  "-dCompatibilityLevel=1.4",
  "-dPDFSETTINGS=/ebook",     // 仅 compress 且选择预设时插入
  "-dNOPAUSE",
  "-dBATCH",
  "-sOutputFile=output.pdf",
  "input.pdf"
]
```
当终端输出与进度条**均未开启**时自动插入 `-dQUIET` 静默 GS 日志。

**执行方式**：通过 Emscripten `Module.preRun` 将输入写入虚拟文件系统（`input.pdf` / `input0.pdf`…），`callMain()` 执行，`postRun` 读回 `output.pdf` 并以 `{ pdfArrayBuffer, pdfDataURL }` 回传（主线程优先使用 ArrayBuffer）。

**消息通信**：
```javascript
// Worker → 主线程：进度
self.postMessage({ type: 'progress', data: 'Page 1' });
// Worker → 主线程：最终结果（含错误时为 { error: '...' }）
self.postMessage({ type: 'result', data: { pdfArrayBuffer, pdfDataURL } });
```

### 6. 主题系统（多主题设计）

- 5 套主题定义于 `src/hooks/useTheme.js` 的 `UI_THEMES`，默认 `bento`
- 实现：`<html data-ui="bento|aurora|swiss|brutalism|terminal">` 属性选择器 + `src/index.css` 中为每套主题定义 CSS 变量（`--surface`、`--ink`、`--brand`、`--radius-card`、`--shadow-pop`、`--font-display` 等）
- Tailwind 通过语义化 token 消费变量（`bg-surface`、`text-ink`、`text-brand`、`rounded-card` 等，见 `tailwind.config.js`），组件代码与具体主题解耦
- `index.html` 内联脚本在首帧前应用主题，避免闪烁；支持 URL 参数强制指定：`?ui=terminal&dark=1`（用于主题预览），优先级：URL 参数 > localStorage > 系统偏好/默认值
- `ThemeSwitcher` 下拉菜单带每套主题的迷你配色预览

### 7. server.cjs - 本地静态服务器（可选）

- Express 托管 `dist/`，挂载于 `/web-local-pdf-tools`（与 vite `base` 一致），根路径重定向
- SPA fallback：未知路径回退 `index.html`
- morgan 日志写入 `logs/access.log`，错误写入 `logs/error.log`；提供 `/logs/access`、`/logs/error` 只读查看端点
- 端口从 5000 起，被占用自动 +1 重试；启动后自动打开浏览器
- 通过 `pkg` 打包为 exe 时（`process.pkg` 检测），以 exe 所在目录解析 `dist/` 与 `logs/`

---

## 🔄 数据流程

### 压缩/合并/分割（Ghostscript WASM）

```
用户选择文件（File → Blob URL）
    ↓
usePdfOperations.processPDF() 组装 dataStruct（操作类型 + 设置 + Blob URL）
    ↓
processWithGS() → worker-init.js 创建 Worker
    ↓
background-worker.js：XHR 取回文件 → 写入 WASM 虚拟 FS → callMain() 执行 GS
    ↓
读回 output.pdf → 返回 { pdfArrayBuffer, pdfDataURL }
    ↓
主线程将 ArrayBuffer 包装为 Blob URL → DownloadList 提供下载
```

### PDF 解析（pdfjs-dist）

```
读取文件为 ArrayBuffer
    ↓
pdfjs-dist 加载文档 → 逐页 getTextContent()
    ↓
文本按页存储（parsedPages / parsedPageItems）
    ↓
Canvas 渲染当前页预览 + 透明文本层（支持选择高亮）
```

### 转换（Convert）

```
PDF → 图片：pdfjs 逐页 getViewport({scale: 2}) → Canvas 渲染 → toDataURL → Blob URL（按页码命名）
图片 → PDF：jsPDF 按图片方向逐页添加（A4 居中缩放）→ ArrayBuffer → Blob URL
```

---

## ⚙️ 配置说明

### Vite 配置（vite.config.js）

```javascript
export default defineConfig({
  root: './',
  plugins: [react()],
  build: { target: "esnext", outDir: 'dist' },
  base: "/web-local-pdf-tools/",  // GitHub Pages 部署路径（server.cjs 与之一致）
  worker: { format: 'es' },        // Worker 使用 ES 模块格式
  server: { port: 3000 },          // 开发服务器端口
  preview: { port: 5000 }          // 预览服务器端口
});
```

### TailwindCSS 配置（tailwind.config.js）

- `darkMode: 'class'`
- 语义化颜色 token（`surface`/`line`/`ink`/`brand`/`ok`/`danger`）全部指向 CSS 变量，由 `src/index.css` 按主题提供值；旧版 `primary`/`accent`/`muted` 色板保留用于渐进迁移
- 字体（`font-sans/display/mono`）、阴影（`shadow-card/pop`）、圆角（`rounded-card/btn/input`）同样走 CSS 变量
- 新增组件时应优先使用语义化 token，而不是硬编码颜色

---

## 🚀 开发指南

### 环境要求

- Node.js >= 16.x
- npm >= 8.x

### 常用命令

```bash
npm install            # 安装依赖
npm run dev            # 开发模式，http://localhost:3000
npm run build          # 生产构建，输出 dist/
npm run preview        # 预览生产构建，http://localhost:5000
npm run test           # 单元测试（node:test，用例位于 tests/）
npm run serve          # 用 server.cjs 托管 dist/（自动开浏览器、写日志）
npm run build:win:exe  # 构建并用 pkg 打包 Windows exe（web-local-pdf-tools.exe）
```

> 注意：`web-local-pdf-tools.exe` 为打包产物，已加入 `.gitignore`，不要提交到仓库。

---

## 🧪 测试建议

### 功能测试清单

#### PDF 压缩
- [ ] 上传单个 PDF，分别选择 5 种质量预设，验证输出大小
- [ ] 自定义命令（含引号参数）与缺少必需参数时的报错
- [ ] 高级设置（兼容性级别、图像降采样与分辨率）
- [ ] 终端输出与进度条的开关组合（均关闭时 GS 静默）

#### PDF 合并
- [ ] 2 个及 5+ 个 PDF 合并，拖拽调整顺序后验证页面顺序
- [ ] 添加/移除文件，少于 2 个文件时的校验提示

#### PDF 分割
- [ ] 提取前几页 / 中间页 / 最后几页
- [ ] 无效页码（非整数、start > end、超出页数）的错误处理

#### PDF 解析
- [ ] 纯文本 PDF 与含图像 PDF
- [ ] 页面导航、左右栏选择高亮双向同步
- [ ] 复制单页/全部文本、导出 TXT

#### 转换
- [ ] PDF → JPG/PNG/BMP，页码范围（如 `1,3-5`）与逐页下载
- [ ] 多图 → PDF（含横竖混排），拖拽排序后页面顺序正确

#### UI/UX
- [ ] 5 套 UI 主题切换与刷新后持久化，`?ui=xxx&dark=1` 参数预览
- [ ] 暗黑模式切换、语言切换（英文/中文）
- [ ] 拖放上传、响应式布局（移动端/平板/桌面）
- [ ] 错误消息显示

### 浏览器兼容性测试

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] 移动浏览器（iOS Safari、Chrome Android）

---

## 🐛 常见问题

### 1. Worker / WASM 加载失败

**问题**：构建后 Worker 或 `gs-worker.wasm` 路径不正确。

**解决**：项目通过 `new URL('./background-worker.js', import.meta.url)` 与 `new URL('./gs-worker.wasm', import.meta.url)` 解析资源（worker 内 `locateFile` 兜底指向 base 路径）。保持 `vite.config.js` 中 `worker.format: 'es'`，勿改为其他打包方式。

### 2. Ghostscript WASM 加载慢

**问题**：首次加载 WASM 文件较大，耗时较长。

**解决**：使用 CDN 加速；添加加载提示；考虑懒加载优化。

### 3. PDF 解析乱码 / 提取不到文本

**原因**：特殊字体编码；扫描版 PDF（图像）无文本层。

**解决**：提示用户该 PDF 可能不支持文本提取；OCR（高级解析）待实现。

### 4. 大文件处理超时

**问题**：超大 PDF 处理超过 1 小时超时限制（`worker-init.js`）。

**解决**：按需调大超时时间；优化 Ghostscript 参数；提示用户分段处理。

---

## 🔐 隐私与安全

1. **本地处理**：所有 PDF 处理操作完全在浏览器中执行（Worker + WASM）
2. **无服务器上传**：文件从不离开用户设备
3. **临时 Blob URL**：`resetForm` 等路径会及时 `revokeObjectURL` 释放内存
4. **开源透明**：代码完全开源，可自行审查
5. **server.cjs 仅静态托管**：Express 服务器只提供 dist 静态文件与日志查看，不接收用户文件

---

## 📈 性能优化

### 已实现

1. **Web Worker 后台处理**：GS 任务不阻塞主线程，完成后即终止
2. **ArrayBuffer 直传**：Worker 结果优先以 ArrayBuffer 回传，避免跨上下文 Blob URL 问题
3. **Blob URL 管理**：重置/替换时及时 revoke，防止内存泄漏
4. **代码分割**：Vite 自动分包，jsPDF 按需动态 import（仅图片转 PDF 时加载）

### 待优化

1. 虚拟列表（大量文件合并时）
2. 解析视图分页/增量渲染
3. Service Worker 缓存静态资源
4. Ghostscript WASM 懒加载

---

## 🛠️ 扩展开发建议

1. **高级解析 PDF**：集成 OCR（Tesseract.js）、提取图像/表格/元数据
2. **批量处理**：多文件压缩 + ZIP 打包下载
3. **PDF 水印 / 加密**：文字图片水印、密码保护
4. **TypeScript 迁移**、**状态管理**（Zustand）、**测试**（Vitest + Playwright）、**PWA 离线可用**

---

## 📚 参考资源

- [React](https://react.dev/) / [Vite](https://vitejs.dev/) / [TailwindCSS](https://tailwindcss.com/)
- [PDF.js](https://mozilla.github.io/pdf.js/) / [jsPDF](https://github.com/parallax/jsPDF)
- [Ghostscript Documentation](https://www.ghostscript.com/doc/current/Use.htm)（[PDF Settings](https://www.ghostscript.com/doc/current/VectorDevices.htm#PSPDF_IN)）
- [i18next](https://www.i18next.com/) / [Emscripten](https://emscripten.org/)

---

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -m 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 提交 Pull Request

**代码规范**：使用 Prettier 格式化；遵循 React Hooks 最佳实践；保持组件单一职责；新代码使用语义化 Tailwind token。

**提交规范**：`<type>(<scope>): <subject>`，type 取 `feat` / `fix` / `docs` / `style` / `refactor` / `perf` / `test` / `chore`。

---

## 📝 版本历史

### v1.0.x（当前）

- ✅ PDF 压缩（质量预设 / 自定义 GS 命令 / 高级设置）
- ✅ PDF 合并（多文件 + 拖拽排序）
- ✅ PDF 分割（页码范围）
- ✅ PDF 解析（双栏预览 + 高亮同步 + TXT 导出）
- ✅ PDF/图片 转换（PDF→图片、图片→PDF）
- ✅ 5 套可切换 UI 主题 + 暗黑模式
- ✅ 国际化（英文、中文）、拖放上传、进度条与终端输出
- ✅ 组件/hooks 化重构（App.jsx 拆分为 6 个自定义 hooks）
- ✅ 本地静态服务器 server.cjs + Windows exe 打包
- ✅ 单元测试（node:test）与 CI（GitHub Actions，`.github/workflows/`）

**近期修复（2026-08）**：
- 布局改版（工具站风格）：顶部一排大工具卡选择器（图标+名称+角标快捷键提示，键盘 1-5 切换）；Header 瘦身为纯工具栏（logo+主题/语言/暗黑/GitHub）；主区改双栏工作台——左侧文件区（含 PDF 首页缩略图、大小、页数）+ 右侧粘性操作面板（质量分段控件、高级折叠、全宽 CTA）；处理中进度卡占据操作列而非整页替换；全窗口拖放出现覆盖层"松手即可添加文件"；未选文件时 CTA 置灰并显示引导提示
- 界面信息架构改版：操作介绍大卡片压缩为行内头部；终端输出/进度条/自定义命令/高级设置全部收入"高级选项"折叠区（有激活项时自动展开）；Features/Privacy/Sponsor 从卡片流降级为紧凑 footer
- 合并默认保持原始质量，不再静默降质；质量下拉新增"保持原始质量"选项
- BMP 导出改为真实 24 位 BMP 编码（此前浏览器会把 `image/bmp` 回退成 PNG 内容）
- 解析文本按 `hasEOL` 保留换行、中文连续、Latin 词距按字形几何判断（`joinPdfTextItems`）
- 自定义 Ghostscript 命令补上开关入口并修复合并时的输入文件拼接
- 修正质量下拉 i18n 键名（原 `pdfSettingScreen` 等键缺失导致显示原始键名）
- 下载卡片显示大小反馈：压缩/合并展示"原大小 → 新大小（减小/增大 N%）"，其余操作展示输出大小
- 页码校验：拆分结束页不得超过总页数；转换页码选择提交前校验，越界/非法 token 明确报错
- 单文件操作（压缩/拆分/解析）拖入多个文件时通过 notice 横幅提示，不再静默丢弃
- 加密 PDF 统一友好提示（识别 PDF.js `PasswordException` 与 GS 密码错误，`isPasswordError`）

**已知问题 / 待办**：
- [ ] 高级解析（OCR）待开发
- [ ] 大文件处理可能较慢
- [ ] Ghostscript WASM 首次加载体积较大

---

## 📞 联系方式

- **GitHub**：[firewox/web-local-pdf-tools](https://github.com/firewox/web-local-pdf-tools)
- **赞助**：[GitHub Sponsors](https://github.com/sponsors/firewox) / [Buy Me A Coffee](https://www.buymeacoffee.com/firewox)

## ⚖️ 许可证

本项目采用 **GNU Affero General Public License v3.0 (AGPL-3.0)** 授权，详见 [LICENSE](LICENSE) 文件。

---

**最后更新**：2026年8月29日
**文档版本**：1.1.0
