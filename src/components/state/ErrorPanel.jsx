export default function ErrorPanel({ t, errorMessage, onTryAgain }) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
      <div className="text-red-600 dark:text-red-400 mb-4">
        <p className="text-lg font-semibold mb-2">{t('errorOccurred')}</p>
        <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 rounded-xl p-4 text-left">
          <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap break-words font-mono">
            {errorMessage}
          </pre>
        </div>
      </div>
      <button onClick={onTryAgain} className="btn-danger rounded-lg px-6 py-2 hover:shadow-lg transition-all duration-200">
        {t('tryAgain')}
      </button>
    </div>
  );
}