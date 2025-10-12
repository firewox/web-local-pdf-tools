# dev 1.0.0
1. 我可以点击top bar 菜单，切换到不同的功能模块。main页面里不要再显示 压缩、合并、拆分这个选项
2. 点击 拆分PDF，页面右侧main区域显示拆分PDF的表单，表单包括：
    1. 选择要拆分的PDF文件
    2. 拆分PDF的页码范围，起始页-结束页
    3. 可选择显示终端输出、可显示进度条、可使用高级设置：PDF兼容级别、降采样彩色图像、彩色图案分辨率（DPI）
    3. 拆分PDF的按钮
3. 点击 合并PDF，页面右侧main区域显示合并PDF的表单，表单包括：
    1. 选择要合并的PDF文件
    2. 可选择PDF质量设置、显示终端输出、可显示进度条、可使用高级设置：PDF兼容级别、降采样彩色图像、彩色图案分辨率（DPI）
    3. 合并PDFs的按钮
4. 点击 压缩PDF，页面右侧main区域显示压缩PDF的表单，表单包括：
    1. 选择要压缩的PDF文件
    2. 可选择PDF质量设置、显示终端输出、可显示进度条、可使用高级设置：PDF兼容级别、降采样彩色图像、彩色图案分辨率（DPI）
    3. 压缩PDF的按钮
5. 底部增加一个功能说明：
    功能
        •压缩: 使用质量预设或自定义设置减小文件大小
        •合并: 将多个 PDF 合并为一个文档
        •拆分: 从 PDF 中提取特定页面范围
        •Progress Bar: 带有逐页处理状态的可视化进度跟踪
    隐私与安全：
        所有处理都在您的浏览器中本地进行。不会将任何文件上传到任何服务器。
        在 GitHub 上查看源代码（https://github.com/firewox/web-local-pdf-tools）
    赞助：
        如果您喜欢这个项目，请考虑赞助它。您的支持将帮助我继续开发和维护这个项目。
        您可以通过以下方式赞助：
        • 打赏：通过支付宝、微信支付等方式打赏。
        • 贡献代码：通过 GitHub 提交 Pull Request 贡献代码。
        • 分享：分享项目到您的社交媒体，帮助更多人发现它。
    © 2025 本地 PDF 工具。代码采用 AGPLv3 许可。


# dev 1.0.1.1
在菜单里增加 解析PDF 选项，点击后，页面main区域显示解析PDF的表单，表单包括：
    1. 选择要解析的PDF文件
    2. 可选择显示终端输出、可显示进度条
    3. 解析PDF的按钮
    4. 仅提取PDF文本内容，左侧为预览的pdf内容，右侧为提取的pdf文本内容，可编辑，可复制，可导出，标记号页码。

# dev 1.0.1.2
在解析pdf功能里，main区域，左侧预览pdf，右侧为抽取的文本

# dev 1.0.1.3
左侧预览pdf，右侧为抽取的文本;

# dev 1.0.1.4
左侧预览的pdf要清晰可见，不能模糊；文本选择时，选择的文本不需要高亮，只需要高亮pdf部分的内容即可；当鼠标选中时，左侧pdf内容才高亮，当鼠标不选中时，左侧pdf内容不高亮；

# dev 1.0.1
新增加一个菜单项 `文件转换`，点击后跳转到文件转换页面；
1.可选择要转换的文件；
2. 点击转换按钮，开始转换文件；
2.1 支持 pdf转换jpg、png、jpeg、bmp；支持 jpg、png、jpeg、bmp 转换为 pdf；
2.2 系统根据文件类型来渲染可支持转换的目标文件类型，例如：选择要转换的文件为 pdf 时，目标文件类型渲染为 jpg、png、jpeg、bmp；选择要转换的文件为 jpg、png、jpeg、bmp 时，目标文件类型渲染为 pdf；
3. 增加转换目标文件类型的option 选择框；
4. 转换完成后预览转换后的文件，可直接下载转换后的文件；

# bugFix
当我点击 `文件转换` 时，浏览器控制台出现error
```error
App.jsx:626 
 Uncaught ReferenceError: setConvertFormat is not defined
    at resetForm (App.jsx:626:5)
    at onClick (App.jsx:955:21)
react-dom.development.js:4312 
 Uncaught ReferenceError: setConvertFormat is not defined
    at resetForm (App.jsx:626:5)
    at onClick (App.jsx:955:21)

```
# bugFix
在 `文件转换` 页面上传pdf文件后，点击 `选择格式` 的下拉框没有内容；
# bugFix
1. 选择格式转换后，没有预览转换后的文件；
2. 只转换了pdf的第一页，其他页没有转换；
# bugFix
转换后的文件，下载按钮为 `下载 {{filename}}`，解决一下；
# bugFix
转换文件完成后，预览的文件把 `选择新文件` 按钮挤到了下方，`选择新文件`要放置在最上面；
# bugFix
当点击 `选择新文件` 按钮时，没有弹出文件选择框；
# bugFix
图片转为 pdf时，预览界面显示 PDF file preview not available；我想要在页面上预览转换后的pdf内容；
当我下载后点开后，出现报错信息
```error
We can't open this file
Something went wrong.
```
# bugFix
将图片转为pdf时，出现错误
```error
setPdfUrl is not defined
```
# bugFix
图片转pdf 时，pdf预览界面显示 PDF preview not available: Cannot read properties of null (reading 'clientWidth')，帮我解决；
# bugFix
图片转pdf 时，pdf预览界面显示 PDF preview not available: Cannot read properties of null (reading 'getContext')，帮我解决；
# bugFix
图片转pdf 时，pdf预览界面显示 PDF preview not available: Canvas is not properly initialized，帮我解决；
# bugFix
图片转pdf 时，pdf预览界面显示 PDF preview not available: Failed to render PDF page，
浏览器控制台出现error为
```error
App.jsx:311 
 Error rendering PDF page: Error: Canvas element not found in DOM
    at renderPage (App.jsx:230:23)
```
帮我解决；

# dev 1.0.2
1. 文件转换功能中，pdf转图片时，增加支持用户选择页码转换的功能，用户可以选择要转换的页码范围，可以同时选择某几个单页、某个页码范围；
2. 图片转pdf时，支持一次性上传多个图片，可以拖拉调整图片的顺序，转换时，将图片合并为一个pdf输出，按照图片自己的尺寸转换为pdf，图片的尺寸不一致时，将图片的尺寸进行等比例缩放，使图片的尺寸一致；
# bugFix
图片转换为pdf后，pdf预览解决有问题，pdf没有显示在预览框内，帮我解决
图片转换为pdf后，预览界面显示 Loading PDF preview...时间很长，帮我优化pdf预览。

# dev 1.0.3
1. 文件合并时，可以拖拽文件的顺序；
# bugFix
文件合并为一个文档后，下载文档失败，并且预览也失败，帮我解决；

# release 1.0.0
我想将该应用的运行环境集成到应用中，win用户只要点进去运行应用，应用就可以启动web服务

# dev 1.2.0
先对这个项目的结构进行分析，对 App.jsx 程序的逻辑进行分析，你需要重构 App.jsx 代码，你需要先思考一下，哪些代码是可以独立出来的，哪些功能是可以合并的，哪些功能是可以组件化的；你先设计一个优化后的项目的代码结构，然后根据项目结构重构程序，制定一个任务列表，每个任务都有一个具体的实现步骤。
你需要使得这个项目的代码结构更加清晰，每个模块的功能更加独立，方便维护和扩展；每个组件都有自己的状态和逻辑，组件之间通过props进行通信，而不是直接访问其他组件的状态或逻辑；加入必要的注释，例如：函数的注释、变量的注释、组件的注释等，使得代码更加易读易懂；
注意：我不希望原有的UI布局被修改，我只希望修改代码逻辑，保持原有的UI布局不变；
# bugFix
App.jsx 中的代码还是太多太耦合了，代码有 1700 多行，我需要继续将代码进行解耦，将代码分成多个模块，每个模块负责自己的功能，模块之间通过props进行通信，而不是直接访问其他模块的状态或逻辑；
注意：我不希望原有的UI布局被修改，我只希望修改代码逻辑，保持原有的UI布局不变；
# bugFix
App.jsx 中的代码还是太多了，代码有 1700 多行，我需要将代码分成多个组件或者多个模块，每个组件负责自己的功能，组件之间通过props进行通信，而不是直接访问其他组件的状态或逻辑；
注意：我不希望原有的UI布局被修改，我只希望修改代码逻辑，保持原有的UI布局不变；
# bubgFix
将 App.jsx 中的代码分成多个组件或者多个模块，将state也抽取出来到hooks中，每个组件负责自己的状态和逻辑，组件之间通过props进行通信，而不是直接访问其他组件的状态或逻辑；
注意：我不希望原有的UI布局被修改，我只希望修改代码逻辑，保持原有的UI布局不变；