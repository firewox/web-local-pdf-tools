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
