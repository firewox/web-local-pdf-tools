export default function SettingsPanel({
  t,
  useCustomCommand,
  customCommand,
  setCustomCommand,
  activeTab,
  pdfSetting,
  setPdfSetting,
  splitRange,
  setSplitRange,
  showTerminalOutput,
  setShowTerminalOutput,
  showProgressBar,
  setShowProgressBar,
  useAdvancedSettings,
  setUseAdvancedSettings,
  advancedSettings,
  setAdvancedSettings,
  convertFormat,
  files,
  selectedPages,
  setSelectedPages,
  pdfPageCount,
  isPdfSelected,
  PDF_SETTINGS,
}) {
  return (
    <div className="card space-y-6">
      {useCustomCommand ? (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-900 dark:text-white">
            {t('customCommand')}
          </label>
          <input
            type="text"
            value={customCommand}
            onChange={(e) => setCustomCommand(e.target.value)}
            placeholder={t('customCommandPlaceholder')}
            className="input font-mono text-sm"
          />
          <p className="text-xs text-muted-600 dark:text-muted-400">
            {t('customCommandHelp')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {(activeTab === 'compress' || activeTab === 'merge') && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-900 dark:text-white">
                {t('pdfQualitySetting')}
              </label>
              <select
                value={pdfSetting}
                onChange={(e) => setPdfSetting(e.target.value)}
                className="input"
              >
                {Object.entries(PDF_SETTINGS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          )}

          {activeTab === 'split' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-900 dark:text-white">
                {t('pageRange')}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  placeholder={t('startPage')}
                  value={splitRange.startPage}
                  onChange={(e) => setSplitRange(prev => ({ ...prev, startPage: e.target.value }))}
                  min="1"
                  className="input flex-1"
                />
                <span className="text-muted-600 dark:text-muted-400 font-medium">{t('to')}</span>
                <input
                  type="number"
                  placeholder={t('endPage')}
                  value={splitRange.endPage}
                  onChange={(e) => setSplitRange(prev => ({ ...prev, endPage: e.target.value }))}
                  min="1"
                  className="input flex-1"
                />
              </div>
            </div>
          )}

          {/* Show Terminal Output Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showTerminalOutput"
              checked={showTerminalOutput}
              onChange={(e) => setShowTerminalOutput(e.target.checked)}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
            />
            <label htmlFor="showTerminalOutput" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
              {t('showTerminalOutput')}
            </label>
          </div>

          {/* Show Progress Bar Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showProgressBar"
              checked={showProgressBar}
              onChange={(e) => setShowProgressBar(e.target.checked)}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
            />
            <label htmlFor="showProgressBar" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
              {t('showProgressBar')}
            </label>
          </div>

          {/* Advanced Settings Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="useAdvancedSettings"
              checked={useAdvancedSettings}
              onChange={(e) => setUseAdvancedSettings(e.target.checked)}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
            />
          <label htmlFor="useAdvancedSettings" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
            {t('useAdvancedSettings')}
          </label>
        </div>

        {/* Page Selection for PDF to Image Conversion */}
        {activeTab === 'convert' && convertFormat && ['jpg', 'jpeg', 'png', 'bmp'].includes(convertFormat) && (files?.length || 0) > 0 && isPdfSelected && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              {pdfPageCount > 0 ? `${t('selectPages')} (1-${pdfPageCount})` : t('pageSelectionLoading')}
            </label>
            <input
              type="text"
              placeholder={t('pageSelectionHint')}
              value={selectedPages}
              onChange={(e) => setSelectedPages(e.target.value)}
              className="input"
              disabled={pdfPageCount === 0}
            />
            <p className="text-xs text-muted-600 dark:text-muted-400">
              {t('pageSelectionHelp')}
            </p>
          </div>
        )}

          {/* Advanced Settings Panel */}
          {useAdvancedSettings && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="downsampleImages"
                  checked={advancedSettings.colorImageSettings.downsample}
                  onChange={(e) => setAdvancedSettings(prev => ({
                    ...prev,
                    colorImageSettings: {
                      ...prev.colorImageSettings,
                      downsample: e.target.checked
                    }
                  }))}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                />
                <label htmlFor="downsampleImages" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                  {t('downsampleImages')}
                </label>
              </div>

              {advancedSettings.colorImageSettings.downsample && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    {t('colorImageResolution')}
                  </label>
                  <input
                    type="number"
                    value={advancedSettings.colorImageSettings.resolution}
                    onChange={(e) => setAdvancedSettings(prev => ({
                      ...prev,
                      colorImageSettings: {
                        ...prev.colorImageSettings,
                        resolution: Number(e.target.value)
                      }
                    }))}
                    className="input w-full sm:w-48"
                    min="72"
                    max="1200"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}