export default function PageSubtitle({ t }) {
  return (
    <div className="text-center mb-12">
      <p
        className="text-lg text-muted-600 dark:text-muted-300 max-w-2xl mx-auto"
        dangerouslySetInnerHTML={{ __html: t('subtitle') }}
      />
    </div>
  );
}