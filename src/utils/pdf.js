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