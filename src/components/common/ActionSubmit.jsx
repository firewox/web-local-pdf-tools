export default function ActionSubmit({ t, activeTab, convertFormat }) {
  return (
    <div className="text-center">
      <button
        type="submit"
        className="btn-primary text-lg px-8 py-4 rounded-xl"
        disabled={activeTab === 'convert' && !convertFormat}
      >
        {activeTab === 'compress' && t('compressPdf')}
        {activeTab === 'merge' && t('mergePdfs')}
        {activeTab === 'split' && t('splitPdf')}
        {activeTab === 'parse' && t('parsePdf')}
        {activeTab === 'convert' && t('convertFile')}
      </button>
    </div>
  );
}