import { useEffect, useState } from 'react';

export const UI_THEMES = [
  { id: 'bento', label: 'Bento Grid', descKey: 'themeBentoDesc' },
  { id: 'aurora', label: 'Aurora Glass', descKey: 'themeAuroraDesc' },
  { id: 'swiss', label: 'Swiss Type', descKey: 'themeSwissDesc' },
  { id: 'brutalism', label: 'Neo-Brutalism', descKey: 'themeBrutalismDesc' },
  { id: 'terminal', label: 'Terminal', descKey: 'themeTerminalDesc' },
];

export const DEFAULT_UI_THEME = 'bento';

/**
 * Manages the UI design style (data-ui on <html>) and dark mode (.dark class).
 * Both persist to localStorage; initial values are applied by an inline
 * script in index.html to avoid a flash of the wrong theme.
 */
export function useTheme() {
  const [uiTheme, setUiTheme] = useState(
    () => document.documentElement.dataset.ui || DEFAULT_UI_THEME
  );
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    document.documentElement.dataset.ui = uiTheme;
    localStorage.setItem('ui-theme', uiTheme);
  }, [uiTheme]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return { uiTheme, setUiTheme, dark, setDark };
}
