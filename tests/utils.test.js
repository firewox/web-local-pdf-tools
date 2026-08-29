import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePageSelection, reorderFiles, isPdfFile, isImageFile, joinPdfTextItems, pdfItemPrefix, formatBytes, isPasswordError, findInvalidPageTokens } from '../src/utils/pdf.js';
import { encodeBmp } from '../src/utils/bmp.js';

// ---------- parsePageSelection ----------

test('parsePageSelection returns all pages when selection is empty', () => {
  assert.deepEqual(parsePageSelection('', 3), [1, 2, 3]);
  assert.deepEqual(parsePageSelection('   ', 3), [1, 2, 3]);
});

test('parsePageSelection parses pages and ranges', () => {
  assert.deepEqual(parsePageSelection('1,3-5', 10), [1, 3, 4, 5]);
  assert.deepEqual(parsePageSelection('2,2', 10), [2]); // deduped
});

test('parsePageSelection silently drops out-of-range and invalid parts', () => {
  assert.deepEqual(parsePageSelection('0,11,abc,4', 10), [4]);
  assert.deepEqual(parsePageSelection('5-2', 10), []); // reversed range
  assert.deepEqual(parsePageSelection('999', 10), []);
});

// ---------- joinPdfTextItems / pdfItemPrefix ----------

test('joinPdfTextItems keeps CJK runs contiguous and honors hasEOL', () => {
  const items = [
    { str: '你好' },
    { str: '世界', hasEOL: true },
    { str: '再见' },
  ];
  assert.equal(joinPdfTextItems(items), '你好世界\n再见');
});

test('joinPdfTextItems inserts spaces from glyph geometry for Latin text', () => {
  const items = [
    { str: 'Hello', transform: [1, 0, 0, 12, 0, 10], width: 30 },
    { str: 'world', transform: [1, 0, 0, 12, 40, 10], width: 30 }, // gap 10 > 0.2em
  ];
  assert.equal(joinPdfTextItems(items), 'Hello world');
});

test('joinPdfTextItems adds no space when glyphs touch', () => {
  const items = [
    { str: 'Hel', transform: [1, 0, 0, 12, 0, 10], width: 18 },
    { str: 'lo', transform: [1, 0, 0, 12, 18, 10], width: 12 }, // gap 0
  ];
  assert.equal(joinPdfTextItems(items), 'Hello');
});

test('joinPdfTextItems falls back to script heuristic without geometry', () => {
  assert.equal(joinPdfTextItems([{ str: 'Hello' }, { str: 'world' }]), 'Hello world');
  assert.equal(joinPdfTextItems([{ str: '你好' }, { str: '世界' }]), '你好世界');
});

test('joinPdfTextItems does not double-break after hasEOL and keeps empty-item breaks', () => {
  const items = [
    { str: 'line1', hasEOL: true },
    { str: 'line2' },
    { str: '', hasEOL: true },
    { str: 'line3' },
  ];
  assert.equal(joinPdfTextItems(items), 'line1\nline2\nline3');
});

test('pdfItemPrefix is empty without a previous item or after a line break', () => {
  const item = { str: 'abc' };
  assert.equal(pdfItemPrefix(null, item), '');
  assert.equal(pdfItemPrefix({ str: 'x', hasEOL: true }, item), '');
});

// ---------- encodeBmp ----------

function pixels(width, height, rgbaRows) {
  return { width, height, data: new Uint8ClampedArray(rgbaRows.flat()) };
}

test('encodeBmp writes valid headers', () => {
  const buf = encodeBmp(pixels(2, 1, [[255, 0, 0, 255], [0, 0, 255, 255]]));
  const bytes = new Uint8Array(buf);
  const view = new DataView(buf);

  assert.equal(bytes[0], 0x42); // 'B'
  assert.equal(bytes[1], 0x4d); // 'M'
  assert.equal(view.getUint32(2, true), 54 + 8); // file size: row of 2 px padded to 8 bytes
  assert.equal(view.getUint32(10, true), 54); // pixel data offset
  assert.equal(view.getUint32(14, true), 40); // info header size
  assert.equal(view.getInt32(18, true), 2); // width
  assert.equal(view.getInt32(22, true), 1); // height
  assert.equal(view.getUint16(28, true), 24); // bits per pixel
  assert.equal(view.getUint32(30, true), 0); // BI_RGB
});

test('encodeBmp stores rows bottom-up as BGR with padding', () => {
  const buf = encodeBmp(pixels(2, 1, [[255, 0, 0, 255], [0, 0, 255, 255]]));
  const bytes = new Uint8Array(buf);

  // red pixel -> BGR bytes (0,0,255); blue pixel -> (255,0,0); 2 padding bytes
  assert.deepEqual([...bytes.slice(54, 62)], [0, 0, 255, 255, 0, 0, 0, 0]);
});

test('encodeBmp pads rows not divisible by 4', () => {
  const buf = encodeBmp(pixels(3, 1, [
    [1, 2, 3, 255], [4, 5, 6, 255], [7, 8, 9, 255],
  ]));
  const view = new DataView(buf);
  const bytes = new Uint8Array(buf);

  assert.equal(view.getUint32(34, true), 12); // pixel array: row 9 bytes padded to 12
  assert.equal(buf.byteLength, 54 + 12);
  assert.deepEqual([...bytes.slice(54, 63)], [3, 2, 1, 6, 5, 4, 9, 8, 7]); // BGR of 1..9
  assert.deepEqual([...bytes.slice(63, 66)], [0, 0, 0]); // padding
});

// ---------- file utils ----------

test('reorderFiles moves an item without mutating the source list', () => {
  const list = ['a', 'b', 'c'];
  const result = reorderFiles(list, 0, 2);
  assert.deepEqual(result, ['b', 'c', 'a']);
  assert.deepEqual(list, ['a', 'b', 'c']);
});

test('isPdfFile and isImageFile detect by MIME type or extension', () => {
  assert.equal(isPdfFile({ type: 'application/pdf' }), true);
  assert.equal(isPdfFile({ name: 'doc.PDF' }), true);
  assert.equal(isPdfFile({ name: 'doc.txt' }), false);
  assert.equal(isImageFile({ type: 'image/png' }), true);
  assert.equal(isImageFile({ name: 'photo.bmp' }), true);
  assert.equal(isImageFile({ name: 'photo.tiff' }), false);
});

// ---------- formatBytes ----------

test('formatBytes renders human-readable sizes', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(500), '500 B');
  assert.equal(formatBytes(2048), '2.0 KB');
  assert.equal(formatBytes(5 * 1024 * 1024), '5.0 MB');
  assert.equal(formatBytes(3 * 1024 * 1024 * 1024), '3.0 GB');
  assert.equal(formatBytes(1234567), '1.2 MB');
  assert.equal(formatBytes(undefined), '0 B');
});

// ---------- isPasswordError ----------

test('isPasswordError detects PDF.js and Ghostscript password failures', () => {
  assert.equal(isPasswordError({ name: 'PasswordException', message: 'No password given' }), true);
  assert.equal(isPasswordError(new Error('This PDF requires a password')), true);
  assert.equal(isPasswordError('Ghostscript error: Incorrect password given'), true);
  assert.equal(isPasswordError(new Error('File not found')), false);
  assert.equal(isPasswordError('other failure'), false);
  assert.equal(isPasswordError(null), false);
  assert.equal(isPasswordError(undefined), false);
});

// ---------- findInvalidPageTokens ----------

test('findInvalidPageTokens flags out-of-range and malformed tokens', () => {
  assert.deepEqual(findInvalidPageTokens('1,3-5', 10), []);
  assert.deepEqual(findInvalidPageTokens('', 10), []);
  assert.deepEqual(findInvalidPageTokens('0,11,abc,5-2,4', 10), ['0', '11', 'abc', '5-2']);
  assert.deepEqual(findInvalidPageTokens('1-10', 10), []);
  assert.deepEqual(findInvalidPageTokens('1-11', 10), ['1-11']);
});
