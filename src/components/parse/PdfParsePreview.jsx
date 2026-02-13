export default function PdfParsePreview({ t, previewContainerRef, canvasRef, textLayerRef, handleLeftSelection }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{t('pdfPreview')}</h4>
      </div>
      <div ref={previewContainerRef} className="border border-muted-200 dark:border-gray-700 rounded-xl overflow-hidden relative">
        <canvas ref={canvasRef} className="w-full bg-white dark:bg-gray-900"></canvas>
        <div
          ref={textLayerRef}
          className="absolute left-0 top-0 w-full h-full"
          onMouseUp={handleLeftSelection}
        />
      </div>
    </div>
  );
}