// Utility functions for PDF and image handling
// These are extracted from App.jsx to promote reuse and testability.

/**
 * Check if a file is a PDF by MIME type or extension.
 * @param {File} file
 * @returns {boolean}
 */
export const isPdfFile = (file) => {
  if (!file) return false;
  const name = file.name?.toLowerCase() || '';
  return file.type === 'application/pdf' || name.endsWith('.pdf');
};

/**
 * Check if a file is an image by MIME type or extension.
 * @param {File} file
 * @returns {boolean}
 */
export const isImageFile = (file) => {
  if (!file) return false;
  if (file.type?.startsWith('image/')) return true;
  return /(\.jpg|\.jpeg|\.png|\.bmp)$/i.test(file.name || '');
};

/**
 * Parse a page selection string like "1,3-5,7" into an array of page numbers.
 * If selection is empty, returns all pages from 1..totalPages.
 * @param {string} selection
 * @param {number} totalPages
 * @returns {number[]}
 */
export function parsePageSelection(selection, totalPages) {
  if (!selection || selection.trim() === '') {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set();
  const parts = selection.split(',');

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const rangeMatch = trimmed.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1]);
      const end = parseInt(rangeMatch[2]);

      if (!isNaN(start) && !isNaN(end) && start <= end && start >= 1 && end <= totalPages) {
        for (let i = start; i <= end; i++) {
          pages.add(i);
        }
      }
    } else {
      const pageNum = parseInt(trimmed);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        pages.add(pageNum);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

/**
 * Reorder a list by moving the item at startIndex to endIndex.
 * @template T
 * @param {T[]} list
 * @param {number} startIndex
 * @param {number} endIndex
 * @returns {T[]}
 */
export const reorderFiles = (list, startIndex, endIndex) => {
  const updated = [...list];
  const [removed] = updated.splice(startIndex, 1);
  updated.splice(endIndex, 0, removed);
  return updated;
};

const LATIN_PREV_CHAR = /[A-Za-z0-9,;:!?%)\]"'”’]/;
const LATIN_NEXT_CHAR = /[A-Za-z0-9(\["'“‘]/;
/**
 * Decide whether a space belongs between two consecutive PDF text items.
 * Uses glyph geometry when available (gap larger than 0.2em), falling back to
 * a script-aware heuristic that keeps CJK runs contiguous.
 */
function needsSpaceBetween(prevItem, item) {
  const prevEnd = prevItem.transform && typeof prevItem.width === 'number'
    ? prevItem.transform[4] + prevItem.width
    : null;
  const nextStart = item.transform ? item.transform[4] : null;

  if (prevEnd == null || nextStart == null) {
    const prevChar = prevItem.str[prevItem.str.length - 1];
    const nextChar = item.str[0];
    return LATIN_PREV_CHAR.test(prevChar) && LATIN_NEXT_CHAR.test(nextChar);
  }

  const fontSize = Math.abs(prevItem.transform[3]) || Math.abs(prevItem.transform[0]) || 10;
  return nextStart - prevEnd > fontSize * 0.2;
}

/**
 * Separator to render before a text item (after the previous one).
 * Line breaks are handled by the previous item's hasEOL flag.
 * @param {object} [prevItem]
 * @param {object} [item]
 * @returns {''|' '}
 */
export function pdfItemPrefix(prevItem, item) {
  if (!prevItem || !item) return '';
  if (prevItem.hasEOL) return '';
  if (!(prevItem.str || '').length || !(item.str || '').length) return '';
  return needsSpaceBetween(prevItem, item) ? ' ' : '';
}

/**
 * Join PDF text items into readable plain text: keeps CJK runs contiguous,
 * derives spaces from glyph geometry for Latin text, and honors hasEOL breaks.
 * @param {Array<{str?: string, hasEOL?: boolean}>} items
 * @returns {string}
 */
export function joinPdfTextItems(items) {
  let text = '';
  let prev = null;
  for (const item of items || []) {
    const str = item.str || '';
    if (prev && str) text += pdfItemPrefix(prev, item);
    text += str;
    if (item.hasEOL) text += '\n';
    // Empty items can still end a line; remember them so the next prefix
    // knows the break already happened.
    if (str || item.hasEOL) prev = item;
  }
  return text;
}

/**
 * Format a byte count as a human-readable string (B / KB / MB / GB).
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = n;
  let unit = 'B';
  for (const unitName of units) {
    if (value < 1024) break;
    value /= 1024;
    unit = unitName;
  }
  return `${value >= 100 ? Math.round(value) : value.toFixed(1)} ${unit}`;
}

/**
 * Detect password-protection errors from PDF.js or Ghostscript output.
 * Accepts an Error object (checks name/message) or a raw message string.
 * @param {Error|{name?: string, message?: string}|string} [error]
 * @returns {boolean}
 */
export function isPasswordError(error) {
  if (!error) return false;
  if (error.name === 'PasswordException') return true;
  return /password/i.test(String(error.message || error));
}

/**
 * Return the page-selection tokens that are out of range or malformed,
 * e.g. "1,999" with 10 pages -> ["999"]. Empty selection is always valid.
 * @param {string} selection - page selection like "1,3-5"
 * @param {number} totalPages
 * @returns {string[]}
 */
export function findInvalidPageTokens(selection, totalPages) {
  const invalid = [];
  if (!selection || selection.trim() === '') return invalid;
  for (const part of selection.split(',')) {
    const token = part.trim();
    if (!token) continue;
    const rangeMatch = token.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1]);
      const end = parseInt(rangeMatch[2]);
      if (isNaN(start) || isNaN(end) || start < 1 || end < start || end > totalPages) {
        invalid.push(token);
      }
    } else {
      const page = parseInt(token);
      if (isNaN(page) || page < 1 || page > totalPages) {
        invalid.push(token);
      }
    }
  }
  return invalid;
}