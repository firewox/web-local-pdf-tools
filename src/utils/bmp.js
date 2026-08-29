/**
 * Minimal 24-bit BMP encoder. Browsers cannot encode BMP via canvas.toDataURL,
 * so PDF pages rendered to a canvas are encoded here from raw pixel data.
 * Alpha is dropped; pdf.js already composites pages onto a white background.
 */

const FILE_HEADER_SIZE = 14;
const INFO_HEADER_SIZE = 40;
const PIXEL_DATA_OFFSET = FILE_HEADER_SIZE + INFO_HEADER_SIZE;

/**
 * Encode RGBA pixel data as a bottom-up 24-bit uncompressed BMP.
 * @param {{width: number, height: number, data: Uint8ClampedArray}} imageData - e.g. canvas 2D getImageData()
 * @returns {ArrayBuffer} - BMP file content
 */
export function encodeBmp(imageData) {
  const { width, height, data } = imageData;
  const rowSize = Math.ceil((width * 3) / 4) * 4; // rows padded to 4 bytes
  const pixelArraySize = rowSize * height;
  const fileSize = PIXEL_DATA_OFFSET + pixelArraySize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // BITMAPFILEHEADER
  bytes[0] = 0x42; // 'B'
  bytes[1] = 0x4d; // 'M'
  view.setUint32(2, fileSize, true);
  view.setUint32(10, PIXEL_DATA_OFFSET, true);

  // BITMAPINFOHEADER
  view.setUint32(14, INFO_HEADER_SIZE, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true); // positive height = bottom-up rows
  view.setUint16(26, 1, true); // color planes
  view.setUint16(28, 24, true); // bits per pixel
  view.setUint32(30, 0, true); // BI_RGB, no compression
  view.setUint32(34, pixelArraySize, true);
  view.setInt32(38, 2835, true); // 72 DPI
  view.setInt32(42, 2835, true);

  let offset = PIXEL_DATA_OFFSET;
  for (let y = height - 1; y >= 0; y--) {
    const rowStart = y * width * 4;
    for (let x = 0; x < width; x++) {
      const src = rowStart + x * 4;
      bytes[offset++] = data[src + 2]; // B
      bytes[offset++] = data[src + 1]; // G
      bytes[offset++] = data[src]; // R
    }
    offset += rowSize - width * 3;
  }

  return buffer;
}
