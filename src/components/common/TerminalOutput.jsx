import { forwardRef } from 'react';

/**
 * Terminal output area component.
 * Props:
 * - terminalData: string
 * - t: translation function
 * - ref: forwardRef for scrolling
 */
const TerminalOutput = forwardRef(function TerminalOutput({ terminalData, t }, ref) {
  return (
    <div ref={ref} className="bg-black dark:bg-gray-900 rounded-lg p-3 max-h-32 overflow-y-auto">
      <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-words">
        {terminalData || t('initializing')}
      </pre>
    </div>
  );
});

export default TerminalOutput;