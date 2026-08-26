import RightButtonBar from '../RightButtonBar.jsx';

const TABS = ['split', 'merge', 'compress', 'parse', 'convert'];

export default function HeaderNav({ t, activeTab, setActiveTab, resetForm }) {
  return (
    <header className="site-header sticky top-0 z-40 w-full">
      <nav className="container mx-auto max-w-4xl px-4 py-3 flex flex-row items-center justify-between gap-3">
        {/* Left: Logo + Top Menu */}
        <div className="flex items-center h-full min-w-0">
          <img
            src="/web-local-pdf-tools/pdf-file.svg"
            alt="PDF Icon"
            className="w-8 h-8 md:w-10 md:h-10 mr-3 shrink-0"
          />
          <h1 className="hidden sm:block text-xl md:text-2xl font-bold text-ink whitespace-nowrap" style={{ letterSpacing: 'var(--tracking-display)' }}>
            {t('title')}
          </h1>
          {/* Top bar menu */}
          <div className="ml-4 flex items-center gap-1 overflow-x-auto">
            {TABS.map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  className={`px-3 py-1.5 rounded-btn text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    active
                      ? 'bg-brand text-brand-ink shadow-btn'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-alt'
                  }`}
                  onClick={() => {
                    if (activeTab !== tab) {
                      setActiveTab(tab);
                      resetForm();
                    }
                  }}
                  title={t(tab)}
                >
                  {t(tab)}
                </button>
              );
            })}
          </div>
        </div>
        {/* Right: Buttons */}
        <div className="flex items-center h-full shrink-0">
          <RightButtonBar />
        </div>
      </nav>
    </header>
  );
}
