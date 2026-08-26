export default function ErrorPanel({ t, errorMessage, onTryAgain }) {
  return (
    <div className="rounded-card border border-danger bg-danger-soft p-6 text-center">
      <div className="text-danger mb-4">
        <svg className="w-10 h-10 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <p className="text-lg font-semibold mb-2">{t('errorOccurred')}</p>
        <div className="bg-surface border border-line rounded-btn p-4 text-left">
          <pre className="text-sm text-danger whitespace-pre-wrap break-words font-mono">
            {errorMessage}
          </pre>
        </div>
      </div>
      <button onClick={onTryAgain} className="btn-danger px-6 py-2">
        {t('tryAgain')}
      </button>
    </div>
  );
}
