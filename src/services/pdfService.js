import { _GSPS2PDF } from '../lib/worker-init.js';

/**
 * Process PDF using Ghostscript via Web Worker.
 * @param {Object} dataObject - includes operation, settings, and input urls
 * @param {(text:string)=>void} [progressCallback] - optional callback for streaming output/progress
 * @returns {Promise<Object>} - result object containing url and metadata
 */
export function processWithGS(dataObject, progressCallback) {
  return _GSPS2PDF(dataObject, null, progressCallback);
}