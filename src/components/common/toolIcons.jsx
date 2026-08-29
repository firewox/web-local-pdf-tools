// Shared per-tool SVG paths (24x24 stroke icons) used by the tool selector
// and the compact operation header.
export const TOOL_ICONS = {
  compress: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
  ),
  merge: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 4.5v13.5m0-13.5L4.5 8M8 4.5L11.5 8M16 19.5V6m0 13.5L19.5 16M16 19.5L12.5 16" />
  ),
  split: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.75-12H8.25c-.621 0-1.125.504-1.125 1.125v13.5c0 .621.504 1.125 1.125 1.125h7.5c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125z" />
  ),
  parse: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75h9A1.5 1.5 0 0118 5.25v13.5a1.5 1.5 0 01-1.5 1.5h-9a1.5 1.5 0 01-1.5-1.5V5.25a1.5 1.5 0 011.5-1.5zM9 8.25h6M9 11.25h6M9 14.25h3.5" />
  ),
  convert: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  ),
};

// Display order = task frequency; also drives the 1-5 keyboard shortcuts
export const TOOL_ORDER = ['compress', 'merge', 'split', 'parse', 'convert'];
