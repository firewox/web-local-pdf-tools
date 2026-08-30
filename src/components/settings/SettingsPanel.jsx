import { useState } from 'react';

function CheckRow({ id, checked, onChange, label }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded cursor-pointer"
      />
      <label htmlFor={id} className="text-sm text-ink cursor-pointer">
        {label}
      </label>
    </div>
  );
}

export default function SettingsPanel({
  t,
  useCustomCommand,
  setUseCustomCommand,
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
  repairMode,
  setRepairMode,
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
  const [moreOpen, setMoreOpen] = useState(false);
  const isGsTab = activeTab === 'compress' || activeTab === 'merge' || activeTab === 'split';
  // Auto-expand the fold while any folded option is active so state stays visible
  const advancedOpen = moreOpen || useCustomCommand || useAdvancedSettings || showTerminalOutput || showProgressBar || repairMode;
  const activeQuality = PDF_SETTINGS[pdfSetting];

  return (
    <div className="card space-y-5">
      {/* Primary task settings */}
      {(activeTab === 'compress' || activeTab === 'merge') && (
        <div className={useCustomCommand ? 'opacity-50 pointer-events-none' : ''}>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-2">
            {t('pdfQualitySetting')}
          </label>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('pdfQualitySetting')}>
            {Object.entries(PDF_SETTINGS).map(([value, config]) => (
              <button
                key={value}
                type="button"
                aria-pressed={pdfSetting === value}
                onClick={() => setPdfSetting(value)}
                className={`px-3.5 py-2 rounded-btn text-sm font-medium border transition-all duration-150 ${
                  pdfSetting === value
                    ? 'bg-brand text-brand-ink border-transparent shadow-btn'
                    : 'bg-surface-alt text-ink-muted border-line hover:text-ink hover:border-line-strong'
                }`}
              >
                {config.short}
              </button>
            ))}
          </div>
          <p className="text-xs text-ink-faint mt-2 min-h-[1rem]">
            {activeQuality ? activeQuality.desc : ''}
          </p>
        </div>
      )}

      {activeTab === 'split' && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint">
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
            <span className="text-ink-muted font-medium">{t('to')}</span>
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

      {/* Page selection for PDF to image conversion */}
      {activeTab === 'convert' && convertFormat && ['jpg', 'jpeg', 'png', 'bmp'].includes(convertFormat) && (files?.length || 0) > 0 && isPdfSelected && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint">
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
          <p className="text-xs text-ink-faint">
            {t('pageSelectionHelp')}
          </p>
        </div>
      )}

      {/* Fold: low-frequency options live here to keep the main flow focused */}
      <div className="border-t border-line pt-4">
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={advancedOpen}
          className="flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${advancedOpen ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          {t('advancedOptions')}
        </button>

        {advancedOpen && (
          <div className="mt-4 space-y-4">
            {isGsTab && (
              <>
                <CheckRow
                  id="useCustomCommand"
                  checked={useCustomCommand}
                  onChange={setUseCustomCommand}
                  label={t('useCustomCommand')}
                />
                {useCustomCommand && (
                  <div className="pl-7 space-y-2">
                    <input
                      type="text"
                      value={customCommand}
                      onChange={(e) => setCustomCommand(e.target.value)}
                      placeholder={t('customCommandPlaceholder')}
                      className="input font-mono text-sm"
                    />
                    <p className="text-xs text-ink-faint">{t('customCommandHelp')}</p>
                  </div>
                )}
              </>
            )}

            <CheckRow
              id="showTerminalOutput"
              checked={showTerminalOutput}
              onChange={setShowTerminalOutput}
              label={t('showTerminalOutput')}
            />
            <CheckRow
              id="showProgressBar"
              checked={showProgressBar}
              onChange={setShowProgressBar}
              label={t('showProgressBar')}
            />
            <CheckRow
              id="useAdvancedSettings"
              checked={useAdvancedSettings}
              onChange={setUseAdvancedSettings}
              label={t('useAdvancedSettings')}
            />

            {activeTab === 'compress' && (
              <CheckRow
                id="repairMode"
                checked={repairMode}
                onChange={setRepairMode}
                label={t('repairMode')}
              />
            )}

            {useAdvancedSettings && isGsTab && (
              <div className="pl-7 space-y-3">
                <CheckRow
                  id="downsampleImages"
                  checked={advancedSettings.colorImageSettings.downsample}
                  onChange={(checked) => setAdvancedSettings((prev) => ({
                    ...prev,
                    colorImageSettings: { ...prev.colorImageSettings, downsample: checked },
                  }))}
                  label={t('downsampleImages')}
                />
                {advancedSettings.colorImageSettings.downsample && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <label htmlFor="colorImageResolution" className="text-sm text-ink">
                      {t('colorImageResolution')}
                    </label>
                    <input
                      type="number"
                      id="colorImageResolution"
                      value={advancedSettings.colorImageSettings.resolution}
                      onChange={(e) => setAdvancedSettings((prev) => ({
                        ...prev,
                        colorImageSettings: { ...prev.colorImageSettings, resolution: Number(e.target.value) },
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
    </div>
  );
}
