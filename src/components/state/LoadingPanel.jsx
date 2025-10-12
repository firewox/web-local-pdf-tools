import ProgressBar from "../common/ProgressBar";
import TerminalOutput from "../common/TerminalOutput";

export default function LoadingPanel({ t, activeTab, showProgressBar, progressInfo, showTerminalOutput, terminalData, terminalRef }) {
  return (
    <div className="card text-center space-y-4">
      <div className="text-2xl mb-4 animate-spin-slow">🔄</div>
      <p className="text-lg font-medium text-gray-900 dark:text-white">
        {t('processing', { count: activeTab === 'merge' ? 's' : '' })}
      </p>

      {showProgressBar && (
        <ProgressBar progressInfo={progressInfo} t={t} />
      )}

      {showTerminalOutput && (
        <TerminalOutput ref={terminalRef} terminalData={terminalData} t={t} />
      )}
    </div>
  );
}