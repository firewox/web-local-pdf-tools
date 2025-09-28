# Local PDF Tools

English | [中文](README_CN.md)

This is a PDF processing tool that runs entirely in your browser. It provides three main features:
- **Split PDF**: Extract specific page ranges from a PDF document.
- **Merge PDF**: Combine multiple PDF files into a single document.
- **Compress PDF**: Reduce PDF file size while maintaining quality.
- **Parse PDF**: Extract text content from PDF documents.
- **Advanced Parse PDF**: Use OCR to extract images, metadata, and other structured information.

## Context

This project is a PDF processing tool based on modern Web technology, focused on providing efficient and reliable document processing capabilities. Through pure browser-side implementation, it provides users with core functions such as PDF splitting, merging, compression, and text extraction. Thanks to the cutting-edge Web technology stack, all operations are performed locally, ensuring the security of your document data.

Say goodbye to the complexity and bloat of traditional PDF software (goodbye, WPS, Microsoft Office, and Adobe Acrobat 👋), we pursue a lightweight and elegant tool philosophy. No installation required, no forced subscriptions, no popup distractions - this is what modern tools should look like. Let's use the power of technology to redefine the minimalist beauty of PDF processing tools. 🚀

## Web Worker

The compression is now processed in a web worker so that the main thread doesn't become unresponsive and now there is virtually no limit to the size of the PDF that you can compress :tada:

## Run the project

To run the project, simply do the following steps

```bash
git clone https://github.com/firewox/web-local-pdf-tools.git
cd web-local-pdf-tools
npm install
npm run dev
```

### Build Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Features

### Split PDF
- [x] Extract specific page ranges
- [x] Simple start/end page specification
- [x] Maintains original quality

### Merge PDF
- [x] Combine multiple PDF files into one
- [x] Quality settings for output optimization
- [ ] Drag-and-drop interface for file selection

### Compress PDF
- [x] Multiple quality presets (Screen, eBook, Printer, Prepress, Default)
- [x] Advanced PDF settings (compatibility level, image downsampling)

### Parse PDF
- [x] Extract text content from PDF documents

### Advanced Parse PDF
- [ ] Use OCR to extract images, metadata, and other structured information

### Dark Mode
- [x] Toggle between light and dark themes
- [x] Respects system preference on first visit
- [x] Persistent theme preference

## Privacy & Security

All processing happens locally in your browser. No files are uploaded to any server. Your documents never leave your device.

## Demo

- [ ] [Live Demo](https://firewox.github.io/local-pdf-tools/)

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).
