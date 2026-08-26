import ProgressBar from "../common/ProgressBar";
import TerminalOutput from "../common/TerminalOutput";

export default function LoadingPanel({ t, activeTab, showProgressBar, progressInfo, showTerminalOutput, terminalData, terminalRef }) {
  return (
    <div className="card text-center space-y-4">
      <div className="flex justify-center mb-2">
        <div
          className="w-10 h-10 animate-spin rounded-full border-[3px] border-line border-t-brand"
          role="status"
          aria-label={t('processing', { count: activeTab === 'merge' ? 's' : '' })}
        />
      </div>
      <p className="text-lg font-medium text-ink">
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
