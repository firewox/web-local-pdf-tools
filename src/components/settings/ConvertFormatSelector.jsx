export default function ConvertFormatSelector({ t, convertFormat, setConvertFormat, supportedFormats }) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-900 dark:text-white">
        {t('convertTo')}
      </label>
      <select
        value={convertFormat}
        onChange={(e) => setConvertFormat(e.target.value)}
        className="input"
        disabled={supportedFormats.length === 0}
      >
        <option value="">选择格式</option>
        {supportedFormats.map(format => (
          <option key={format.value} value={format.value}>{format.label}</option>
        ))}
      </select>
    </div>
  );
}