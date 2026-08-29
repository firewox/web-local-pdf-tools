export default function ActionSubmit({ t, activeTab, convertFormat, disabled }) {
  return (
    <div>
      <button
        type="submit"
        className="btn-primary w-full text-lg px-8 py-4"
        disabled={disabled}
      >
        {activeTab === 'compress' && t('compressPdf')}
        {activeTab === 'merge' && t('mergePdfs')}
        {activeTab === 'split' && t('splitPdf')}
        {activeTab === 'parse' && t('parsePdf')}
        {activeTab === 'convert' && t('convertFile')}
      </button>
      {disabled && (
        <p className="text-xs text-ink-faint text-center mt-2">{t('selectFileFirst')}</p>
      )}
    </div>
  );
}
