import RightButtonBar from '../RightButtonBar.jsx';

export default function HeaderNav({ t, activeTab, setActiveTab, resetForm }) {
  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow-soft border-b border-muted-200 dark:border-gray-800">
      <nav className="container mx-auto max-w-4xl px-4 py-4 flex flex-row items-center justify-between">
        {/* Left: Page Title + Top Menu */}
        <div className="flex items-center h-full">
          <img
            src="/web-local-pdf-tools/pdf-file.svg"
            alt="PDF Icon"
            className="w-8 h-8 md:w-10 md:h-10 mr-3"
            style={{ display: 'inline-block', verticalAlign: 'middle' }}
          />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white whitespace-nowrap inline-block align-middle">
            {t('title')}
          </h1>
          {/* Top bar menu */}
          <div className="ml-6 flex items-center gap-2">
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'split' ? 'bg-primary-600 text-white shadow-soft' : 'text-muted-600 dark:text-muted-400 hover:text-gray-900 dark:hover:text-white hover:bg-muted-100 dark:hover:bg-gray-800'}`}
              onClick={() => {
                if (activeTab !== 'split') {
                  setActiveTab('split');
                  resetForm();
                }
              }}
              title={t('split')}
            >
              {t('split')}
            </button>
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'merge' ? 'bg-primary-600 text-white shadow-soft' : 'text-muted-600 dark:text-muted-400 hover:text-gray-900 dark:hover:text-white hover:bg-muted-100 dark:hover:bg-gray-800'}`}
              onClick={() => {
                if (activeTab !== 'merge') {
                  setActiveTab('merge');
                  resetForm();
                }
              }}
              title={t('merge')}
            >
              {t('merge')}
            </button>
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'compress' ? 'bg-primary-600 text-white shadow-soft' : 'text-muted-600 dark:text-muted-400 hover:text-gray-900 dark:hover:text-white hover:bg-muted-100 dark:hover:bg-gray-800'}`}
              onClick={() => {
                if (activeTab !== 'compress') {
                  setActiveTab('compress');
                  resetForm();
                }
              }}
              title={t('compress')}
            >
              {t('compress')}
            </button>
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'parse' ? 'bg-primary-600 text-white shadow-soft' : 'text-muted-600 dark:text-muted-400 hover:text-gray-900 dark:hover:text-white hover:bg-muted-100 dark:hover:bg-gray-800'}`}
              onClick={() => {
                if (activeTab !== 'parse') {
                  setActiveTab('parse');
                  resetForm();
                }
              }}
              title={t('parse')}
            >
              {t('parse')}
            </button>
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'convert' ? 'bg-primary-600 text-white shadow-soft' : 'text-muted-600 dark:text-muted-400 hover:text-gray-900 dark:hover:text-white hover:bg-muted-100 dark:hover:bg-gray-800'}`}
              onClick={() => {
                if (activeTab !== 'convert') {
                  setActiveTab('convert');
                  resetForm();
                }
              }}
              title={t('convert')}
            >
              {t('convert')}
            </button>
          </div>
        </div>
        {/* Right: Buttons */}
        <div className="flex items-center h-full">
          <RightButtonBar />
          {/* Add more right-side buttons here if needed */}
        </div>
      </nav>
    </header>
  );
}