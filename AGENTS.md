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

1. **Code Style**: Follow the existing coding conventions (React, functional components).
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

这是一款完全运行在浏览器中的 PDF 处理工具，追求轻量、优雅、安全的用户体验。所有 PDF 处理操作均在客户端本地执行，确保用户文档数据的绝对安全性，无需上传到任何服务器。

告别传统 PDF 软件（WPS、Microsoft Office、Adobe Acrobat）的繁琐和臃肿，不需要安装，不强制订阅，没有弹窗干扰。

---

## 🎯 主要功能

### 1. PDF 压缩（Compress）
- 多种质量预设选项：
  - `/screen` - 屏幕优化（文件最小）
  - `/ebook` - 电子书质量（较小）
  - `/printer` - 打印机质量（平衡）
  - `/prepress` - 印前质量（高质量）
  - `/default` - 默认（原始质量）
- 高级设置：
  - PDF 兼容性级别配置
  - 图像降采样设置
  - 自定义分辨率（DPI）

### 2. PDF 合并（Merge）
- 支持多个 PDF 文件合并为单个文档
- 可自定义输出质量设置
- 支持逐个添加/移除文件

### 3. PDF 分割（Split）
- 按页码范围提取 PDF 页面
- 简单的起始页/结束页指定
- 保持原始质量

### 4. PDF 解析（Parse）
- 提取 PDF 文档中的文本内容
- 支持逐页预览和导航
- 左侧 PDF 预览，右侧文本显示
- 文本选择高亮同步功能
- 支持复制单页或全部文本
- 支持导出为 TXT 文件

### 5. 通用功能
- **暗黑模式**：支持亮色/暗色主题切换，自动识别系统偏好
- **多语言支持**：英文、简体中文
- **进度显示**：
  - 可视化进度条
  - 终端输出显示
  - 页面级处理进度跟踪

---

## 🏗️ 技术架构

### 技术栈

| 技术/库 | 版本 | 用途 |
|--------|------|------|
| React | 18.2.0 | 前端框架 |
| React DOM | 18.2.0 | DOM 渲染 |
| Vite | 7.1.3 | 构建工具 |
| TailwindCSS | 3.4.17 | CSS 框架 |
| PostCSS | 8.5.6 | CSS 处理 |
| pdfjs-dist | 5.4.149 | PDF 渲染和文本提取 |
| i18next | 23.7.6 | 国际化核心库 |
| react-i18next | 13.5.0 | React 国际化集成 |
| Ghostscript WASM | - | PDF 处理引擎 |

### 项目结构

```
web-local-pdf-tools/
├── public/                      # 静态资源
│   └── pdf-file.svg            # 应用图标
├── src/                         # 源代码
│   ├── App.jsx                 # 主应用组件
│   ├── main.jsx                # 应用入口
│   ├── index.css               # 全局样式
│   ├── components/             # React 组件
│   │   └── RightButtonBar.jsx # 右侧工具栏（暗黑模式、语言切换、GitHub 链接）
│   ├── lib/                    # 核心库
│   │   ├── worker-init.js     # Web Worker 初始化器
│   │   ├── background-worker.js # 后台处理 Worker
│   │   ├── gs-worker.js       # Ghostscript Worker
│   │   ├── gs-worker.wasm     # Ghostscript WebAssembly 二进制
│   │   └── i18n.js            # 国际化配置
│   └── assets/                # 资源文件
├── index.html                  # HTML 入口
├── package.json               # 项目配置
├── vite.config.js             # Vite 配置
├── tailwind.config.js         # Tailwind 配置
├── postcss.config.js          # PostCSS 配置
├── README.md                  # 英文说明
├── README_CN.md               # 中文说明
└── Agents.md                  # 开发文档（本文件）
```

---

## 🔧 核心模块详解

### 1. App.jsx - 主应用组件

**职责**：
- 应用状态管理
- 用户界面渲染
- 文件处理逻辑协调
- PDF 操作触发

**核心状态**：
```javascript
const [activeTab, setActiveTab] = useState("compress");      // 当前激活的功能标签
const [state, setState] = useState("init");                  // 应用状态机
const [files, setFiles] = useState([]);                      // 上传的文件列表
const [downloadLinks, setDownloadLinks] = useState([]);      // 下载链接
const [pdfSetting, setPdfSetting] = useState("/ebook");      // PDF 质量设置
const [splitRange, setSplitRange] = useState({...});         // 分割范围
const [showTerminalOutput, setShowTerminalOutput] = useState(false);  // 终端输出开关
const [showProgressBar, setShowProgressBar] = useState(false);        // 进度条开关
const [parsedPages, setParsedPages] = useState([]);          // 解析的文本页面
```

**状态机**：
- `init` - 初始状态
- `selected` - 文件已选择
- `loading` - 处理中
- `toBeDownloaded` - 处理完成，等待下载
- `parsed` - PDF 解析完成
- `error` - 错误状态

**核心方法**：
- `processPDF()` - 处理 PDF（压缩/合并/分割）
- `parsePDF()` - 解析 PDF 文本
- `changeHandler()` - 文件选择处理
- `renderPdfPage()` - 渲染 PDF 页面到 Canvas
- `getOutputFilename()` - 生成输出文件名

### 2. RightButtonBar.jsx - 右侧工具栏

**功能**：
- 暗黑模式切换
- 语言切换（英文/中文）
- GitHub 链接

**特性**：
- 使用 localStorage 持久化用户偏好
- 自动检测系统主题偏好
- 响应式设计

### 3. worker-init.js - Worker 初始化器

**职责**：
- 创建 Web Worker 实例
- 设置消息通信机制
- Promise 封装处理流程
- 超时控制（1小时）

**核心函数**：
```javascript
export async function _GSPS2PDF(dataStruct, responseCallback, progressCallback)
```

**参数**：
- `dataStruct` - 处理数据结构
  - `operation` - 操作类型（compress/merge/split）
  - `pdfSetting` - PDF 质量设置
  - `files` - 文件列表
  - `splitRange` - 分割范围
  - `advancedSettings` - 高级设置
  - `showTerminalOutput` - 是否显示终端输出
  - `showProgressBar` - 是否显示进度条

**返回**：Promise，包含处理后的 PDF 数据 URL

### 4. background-worker.js - 后台处理 Worker

**职责**：
- 接收主线程消息
- 调用 Ghostscript WASM 处理 PDF
- 返回处理结果或进度信息

**核心功能**：
- `_GSPS2PDF()` - 单文件处理（压缩）
- `_GSMergePDF()` - 多文件合并
- `_GSSplitPDF()` - PDF 分割
- `parseCommandArgs()` - 命令参数解析
- `buildAdvancedArgs()` - 构建高级参数
- `validateArgs()` - 参数验证

**Ghostscript 参数构建**：
```javascript
// 压缩示例
[
  "-sDEVICE=pdfwrite",
  "-dCompatibilityLevel=1.4",
  "-dPDFSETTINGS=/ebook",
  "-dNOPAUSE",
  "-dBATCH",
  "-sOutputFile=output.pdf",
  "input.pdf"
]
```

**消息通信**：
- `{ type: 'progress', data: text }` - 进度更新
- `{ type: 'result', data: {...} }` - 最终结果

### 5. i18n.js - 国际化配置

**支持语言**：
- `en` - English
- `zh` - 简体中文

**翻译键分类**：
- Header - 头部标题
- Tabs - 功能标签
- File input - 文件输入
- Settings - 设置选项
- Buttons - 按钮文本
- Processing states - 处理状态
- Error messages - 错误消息
- Features - 功能说明
- Privacy - 隐私说明

---

## 🎨 UI/UX 设计

### 设计系统

**配色方案**（TailwindCSS）：
- 主色调：`primary-600`（蓝色系）
- 背景渐变：`from-muted-50 to-muted-100`（亮色）/ `from-gray-900 to-gray-800`（暗色）
- 卡片：白色/灰色背景 + 柔和阴影
- 交互反馈：hover 状态 + transition 动画

**组件样式**：
- `.btn-primary` - 主按钮（蓝色背景）
- `.btn-secondary` - 次按钮（灰色背景）
- `.btn-danger` - 危险按钮（红色背景）
- `.btn-success` - 成功按钮（绿色背景）
- `.card` - 卡片容器
- `.input` - 输入框

**响应式设计**：
- 移动优先设计
- 使用 `sm:`, `md:`, `lg:` 断点
- Flexbox 和 Grid 布局

### 用户交互流程

#### 压缩 PDF 流程：
1. 用户选择"压缩"标签
2. 点击"选择 PDF 文件"上传单个文件
3. 选择质量预设（或高级设置）
4. 点击"压缩 PDF"按钮
5. 显示处理进度（可选）
6. 处理完成，显示下载按钮
7. 下载压缩后的文件

#### 合并 PDF 流程：
1. 用户选择"合并"标签
2. 选择多个 PDF 文件（至少2个）
3. 可添加更多文件或移除文件
4. 选择输出质量
5. 点击"合并 PDFs"按钮
6. 显示处理进度
7. 下载合并后的文件

#### 分割 PDF 流程：
1. 用户选择"拆分"标签
2. 选择单个 PDF 文件
3. 输入起始页和结束页
4. 点击"拆分 PDF"按钮
5. 处理并下载指定页面范围

#### 解析 PDF 流程：
1. 用户选择"解析"标签
2. 选择单个 PDF 文件
3. 点击"解析 PDF"按钮
4. 左侧显示 PDF 页面预览，右侧显示文本
5. 可切换页面查看
6. 支持文本选择和高亮同步
7. 可复制单页或全部文本
8. 可导出为 TXT 文件

---

## 🔄 数据流程

### 文件处理流程

```
用户上传文件
    ↓
文件转换为 Blob URL
    ↓
传递给 Worker （dataStruct）
    ↓
Worker 调用 Ghostscript WASM
    ↓
WASM 处理 PDF（压缩/合并/分割）
    ↓
返回处理后的 ArrayBuffer
    ↓
转换为 Blob URL
    ↓
提供下载链接
```

### PDF 解析流程

```
用户上传 PDF
    ↓
读取为 ArrayBuffer
    ↓
pdfjs-dist 加载 PDF 文档
    ↓
逐页提取文本内容
    ↓
渲染 PDF 到 Canvas（预览）
    ↓
构建文本图层（Text Layer）
    ↓
支持文本选择和高亮
```

### Web Worker 通信

**主线程 → Worker**：
```javascript
worker.postMessage({
  target: 'wasm',
  operation: 'compress',
  pdfSetting: '/ebook',
  psDataURL: 'blob:...',
  showTerminalOutput: true,
  showProgressBar: true
});
```

**Worker → 主线程**：
```javascript
// 进度更新
postMessage({ type: 'progress', data: 'Page 1' });

// 最终结果
postMessage({ 
  type: 'result', 
  data: { pdfDataURL: 'blob:...' } 
});

// 错误
postMessage({ 
  type: 'result', 
  data: { error: 'Processing failed' } 
});
```

---

## ⚙️ 配置说明

### Vite 配置（vite.config.js）

```javascript
export default defineConfig({
  root: './',
  plugins: [react()],
  build: { 
    target: "esnext", 
    outDir: 'dist' 
  },
  base: "/web-local-pdf-tools/",  // GitHub Pages 部署路径
  worker: { format: 'es' },        // Worker 使用 ES 模块格式
  server: { port: 3000 },          // 开发服务器端口
  preview: { port: 5000 }          // 预览服务器端口
});
```

### TailwindCSS 配置（tailwind.config.js）

- 启用暗黑模式：`darkMode: 'class'`
- 扫描文件：`./src/**/*.{js,jsx,ts,tsx}`
- 插件：`@tailwindcss/forms`

### PostCSS 配置

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## 🚀 开发指南

### 环境要求

- Node.js >= 16.x
- npm >= 8.x

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问：http://localhost:3000

### 生产构建

```bash
npm run build
```

构建输出：`dist/` 目录

### 预览生产构建

```bash
npm run preview
```

访问：http://localhost:5000

---

## 📦 依赖说明

### 核心依赖

1. **pdfjs-dist** (5.4.149)
   - PDF.js 库，由 Mozilla 开发
   - 用于在浏览器中渲染 PDF 和提取文本
   - 需要配置 Worker：`pdfjs-dist/build/pdf.worker.min.mjs`

2. **i18next** + **react-i18next**
   - 国际化解决方案
   - 支持动态语言切换
   - 持久化语言偏好

3. **Ghostscript WASM**
   - PDF 处理引擎
   - 编译为 WebAssembly，完全在浏览器中运行
   - 支持压缩、合并、分割等操作

### 开发依赖

1. **Vite**
   - 极速的前端构建工具
   - 原生 ES 模块支持
   - 热模块替换（HMR）

2. **TailwindCSS**
   - 实用优先的 CSS 框架
   - 支持暗黑模式
   - 高度可定制

3. **Prettier**
   - 代码格式化工具
   - 保持代码风格一致

---

## 🧪 测试建议

### 功能测试清单

#### PDF 压缩
- [ ] 上传单个 PDF，选择不同质量预设
- [ ] 验证输出文件大小是否符合预期
- [ ] 测试高级设置（兼容性级别、降采样）
- [ ] 测试进度条和终端输出显示

#### PDF 合并
- [ ] 上传 2 个 PDF 文件合并
- [ ] 上传 5+ 个 PDF 文件合并
- [ ] 测试添加/移除文件功能
- [ ] 验证合并后页面顺序正确

#### PDF 分割
- [ ] 提取前 5 页
- [ ] 提取中间页面（如 10-20 页）
- [ ] 提取最后几页
- [ ] 测试无效页码范围的错误处理

#### PDF 解析
- [ ] 解析纯文本 PDF
- [ ] 解析有图像的 PDF
- [ ] 测试页面导航
- [ ] 测试文本选择和高亮同步
- [ ] 测试复制和导出功能

#### UI/UX
- [ ] 暗黑模式切换
- [ ] 语言切换（英文/中文）
- [ ] 响应式布局（移动端、平板、桌面）
- [ ] 错误消息显示

### 浏览器兼容性测试

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] 移动浏览器（iOS Safari、Chrome Android）

---

## 🐛 常见问题

### 1. Worker 加载失败

**问题**：Vite 构建后 Worker 路径不正确

**解决**：
- 确保使用 `new URL('./worker.js', import.meta.url)` 方式引入
- 检查 `vite.config.js` 中 `worker.format` 设置

### 2. Ghostscript WASM 加载慢

**问题**：首次加载 WASM 文件较大，耗时较长

**解决**：
- 使用 CDN 加速
- 添加加载提示
- 考虑懒加载优化

### 3. PDF 解析乱码

**问题**：某些 PDF 文本提取出现乱码

**原因**：
- PDF 使用了特殊字体编码
- 扫描版 PDF（图像）无法提取文本

**解决**：
- 推荐使用 OCR 功能（Advanced Parse PDF - 待实现）
- 提示用户该 PDF 可能不支持文本提取

### 4. 大文件处理超时

**问题**：超大 PDF 文件处理超过 1 小时超时限制

**解决**：
- 增加超时时间配置
- 优化 Ghostscript 参数
- 提示用户分段处理

---

## 🔐 隐私与安全

### 数据安全保障

1. **本地处理**：所有 PDF 处理操作完全在浏览器中执行
2. **无服务器上传**：文件从不离开用户设备
3. **临时 Blob URL**：处理完成后自动释放内存
4. **开源透明**：代码完全开源，可自行审查

### 最佳实践

- 不收集任何用户数据
- 不发送网络请求（除了加载静态资源）
- 不使用第三方跟踪脚本
- 推荐用户在处理敏感文档时使用离线模式

---

## 📈 性能优化

### 已实现的优化

1. **Web Worker 后台处理**
   - 避免主线程阻塞
   - 保持 UI 响应性

2. **Blob URL 管理**
   - 及时释放不再使用的 URL
   - 防止内存泄漏

3. **代码分割**
   - Vite 自动分割 chunks
   - 按需加载模块

4. **图像降采样**
   - 压缩时可配置图像分辨率
   - 平衡文件大小和质量

### 待优化项

1. **虚拟列表**
   - 对于大量文件合并，使用虚拟滚动

2. **增量渲染**
   - 分页渲染 PDF 预览

3. **缓存策略**
   - Service Worker 缓存静态资源

4. **懒加载**
   - 按需加载 Ghostscript WASM

---

## 🛠️ 扩展开发建议

### 功能扩展方向

1. **高级解析 PDF**
   - 集成 OCR 引擎（Tesseract.js）
   - 提取图像、表格、元数据

2. **拖放上传**
   - 实现拖放文件选择界面
   - 更友好的用户体验

3. **PDF 预览**
   - 在处理前预览 PDF 内容
   - 显示页面缩略图

4. **批量处理**
   - 支持一次性处理多个文件
   - 生成 ZIP 压缩包下载

5. **PDF 水印**
   - 添加文字或图片水印
   - 自定义位置和透明度

6. **PDF 加密**
   - 设置密码保护
   - 权限控制

### 技术栈升级建议

1. **TypeScript 迁移**
   - 提高代码类型安全
   - 更好的 IDE 支持

2. **状态管理**
   - 引入 Zustand 或 Redux Toolkit
   - 统一状态管理逻辑

3. **测试覆盖**
   - 单元测试：Vitest
   - E2E 测试：Playwright

4. **PWA 支持**
   - Service Worker
   - 离线可用
   - 安装到桌面

---

## 📚 参考资源

### 官方文档

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [PDF.js](https://mozilla.github.io/pdf.js/)
- [i18next](https://www.i18next.com/)

### Ghostscript

- [Ghostscript Documentation](https://www.ghostscript.com/doc/current/Use.htm)
- [PDF Settings](https://www.ghostscript.com/doc/current/VectorDevices.htm#PSPDF_IN)

### WebAssembly

- [MDN WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly)
- [Emscripten](https://emscripten.org/)

---

## 🤝 贡献指南

### 开发流程

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -m 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 提交 Pull Request

### 代码规范

- 使用 Prettier 格式化代码
- 遵循 React Hooks 最佳实践
- 添加必要的注释
- 保持组件单一职责

### 提交规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type**：
- `feat` - 新功能
- `fix` - 修复 Bug
- `docs` - 文档更新
- `style` - 代码格式调整
- `refactor` - 重构
- `perf` - 性能优化
- `test` - 测试
- `chore` - 构建/工具链

---

## 📝 版本历史

### v1.0.0（当前版本）

**功能**：
- ✅ PDF 压缩（多种质量预设）
- ✅ PDF 合并（多文件）
- ✅ PDF 分割（按页码范围）
- ✅ PDF 解析（文本提取）
- ✅ 暗黑模式支持
- ✅ 国际化（英文、中文）
- ✅ 进度条和终端输出
- ✅ Web Worker 后台处理

**已知问题**：
- [ ] 拖放上传尚未实现
- [ ] 高级解析（OCR）待开发
- [ ] 大文件处理可能较慢

---

## 📞 联系方式

- **GitHub**：[firewox/web-local-pdf-tools](https://github.com/firewox/web-local-pdf-tools)
- **赞助**：[GitHub Sponsors](https://github.com/sponsors/firewox)
- **Buy Me A Coffee**：[buymeacoffee.com/firewox](https://www.buymeacoffee.com/firewox)

---

## ⚖️ 许可证

本项目采用 **GNU Affero General Public License v3.0 (AGPL-3.0)** 授权。

这意味着：
- ✅ 可以自由使用、修改、分发
- ✅ 必须开源修改后的代码
- ✅ 网络服务也需遵守 AGPL 条款
- ✅ 必须保留原作者版权声明

详见：[LICENSE](LICENSE) 文件

---

## 🙏 致谢

感谢以下开源项目：
- **React** - UI 框架
- **Vite** - 构建工具
- **TailwindCSS** - CSS 框架
- **PDF.js** - PDF 渲染引擎
- **Ghostscript** - PDF 处理引擎
- **i18next** - 国际化方案

感谢所有贡献者和用户的支持！

---

**最后更新**：2026年2月13日  
**文档版本**：1.0.0
