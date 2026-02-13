export default function OperationIntro({ t, activeTab }) {
  return (
    <div className="card mb-8">
      {activeTab === 'compress' && (
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('compress')} PDF</h3>
          <p className="text-muted-600 dark:text-muted-300">{t('compressDesc')}</p>
        </div>
      )}
      {activeTab === 'merge' && (
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('merge')} PDFs</h3>
          <p className="text-muted-600 dark:text-muted-300">{t('mergeDesc')}</p>
        </div>
      )}
      {activeTab === 'split' && (
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('split')} PDF</h3>
          <p className="text-muted-600 dark:text-muted-300">{t('splitDesc')}</p>
        </div>
      )}
      {activeTab === 'parse' && (
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('parse')} PDF</h3>
          <p className="text-muted-600 dark:text-muted-300">{t('parseDesc')}</p>
        </div>
      )}
      {activeTab === 'convert' && (
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('convert')} File</h3>
          <p className="text-muted-600 dark:text-muted-300">{t('convertDesc')}</p>
        </div>
      )}
    </div>
  );
}