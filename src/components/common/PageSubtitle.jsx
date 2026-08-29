export default function PageSubtitle({ t }) {
  return (
    <div className="text-center mb-8">
      <p
        className="text-lg text-ink-muted max-w-2xl mx-auto"
        dangerouslySetInnerHTML={{ __html: t('subtitle') }}
      />
    </div>
  );
}