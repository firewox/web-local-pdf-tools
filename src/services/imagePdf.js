/**
 * Create a PDF from multiple image files using jsPDF.
 * @param {{file: File, url: string}[]} inputFiles - selected image entries
 * @param {(current:number, total:number)=>void} [progressCb] - progress updates
 * @returns {Promise<ArrayBuffer>} - PDF as ArrayBuffer
 */
export async function createPdfWithMultipleImages(inputFiles, progressCb) {
  if (!inputFiles || inputFiles.length === 0) {
    throw new Error('No images supplied for PDF generation');
  }

  try {
    const { jsPDF } = await import('jspdf');

    const imageEntries = inputFiles.map(({ file, url }) => ({ file, url }));

    const firstImage = imageEntries[0].file;
    const firstUrl = imageEntries[0].url;
    const firstImg = await loadImage(firstUrl);
    const initialOrientation = firstImg.width >= firstImg.height ? 'landscape' : 'portrait';

    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: initialOrientation });

    let maxWidth = 595.28; // A4 width in points
    let maxHeight = 841.89; // A4 height in points

    const resetDocSize = (orientation) => {
      if (orientation === 'landscape') {
        maxWidth = 841.89; // A4 height as width
        maxHeight = 595.28; // A4 width as height
      } else {
        maxWidth = 595.28;
        maxHeight = 841.89;
      }
    };

    const firstOrientation = firstImg.width >= firstImg.height ? 'landscape' : 'portrait';
    resetDocSize(firstOrientation);

    for (let i = 0; i < imageEntries.length; i++) {
      const { file, url } = imageEntries[i];
      const img = await loadImage(url);
      const width = img.width;
      const height = img.height;
      const orientation = width >= height ? 'landscape' : 'portrait';

      if (i === 0) {
        doc.deletePage(1);
      }

      doc.addPage([maxWidth, maxHeight], orientation);
      resetDocSize(orientation);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL(file.type.includes('png') ? 'image/png' : 'image/jpeg', 0.92);

      const scale = Math.min(maxWidth / width, maxHeight / height);
      const scaledWidth = width * scale;
      const scaledHeight = height * scale;
      const offsetX = (maxWidth - scaledWidth) / 2;
      const offsetY = (maxHeight - scaledHeight) / 2;

      const imageFormat = file.type.includes('png') ? 'PNG' : 'JPEG';
      doc.addImage(dataUrl, imageFormat, offsetX, offsetY, scaledWidth, scaledHeight, undefined, 'FAST');

      if (progressCb) progressCb(i + 1, imageEntries.length);
    }

    return doc.output('arraybuffer');
  } catch (error) {
    console.error('Error creating PDF from multiple images:', error);
    throw error;
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}