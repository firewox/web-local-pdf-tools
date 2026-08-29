import RightButtonBar from '../RightButtonBar.jsx';

// Slim utility header: tool switching lives in the ToolTabs card selector
export default function HeaderNav({ t }) {
  return (
    <header className="site-header sticky top-0 z-40 w-full">
      <nav className="container mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center min-w-0">
          <img
            src="/web-local-pdf-tools/pdf-file.svg"
            alt="PDF Icon"
            className="w-8 h-8 md:w-9 md:h-9 mr-3 shrink-0"
          />
          <h1 className="text-lg md:text-xl font-bold text-ink whitespace-nowrap" style={{ letterSpacing: 'var(--tracking-display)' }}>
            {t('title')}
          </h1>
        </div>
        <div className="flex items-center shrink-0">
          <RightButtonBar />
        </div>
      </nav>
    </header>
  );
}
