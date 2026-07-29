import { useState, useEffect } from 'react';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'userSessionInfo';
const THEME_FIELD = 'prefersColorScheme';

// ─── INITIAL VALUE ────────────────────────────────────────────────────────────
// Reads stored theme; falls back to OS prefers-color-scheme.
export const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed[THEME_FIELD] === 'dark' || parsed[THEME_FIELD] === 'light') {
        return parsed[THEME_FIELD];
      }
    }
  } catch {
    // corrupted storage, fall through to system preference
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// ─── HOOK ────────────────────────────────────────────────────────────────────
// Manages light/dark state, syncs DOM attribute and persists to storage.
export const useTheme = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  // ─── DOM SYNC ─────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const info = stored ? JSON.parse(stored) : {};
      info[THEME_FIELD] = theme;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    } catch {
      // storage unavailable, DOM attribute is still updated
    }
  }, [theme]);

  // ─── OS PREFERENCE LISTENER ─────────────────────────────────────────────────
  // Only auto-switches when the user has no explicit stored preference.
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;

    const handleChange = (e) => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const info = stored ? JSON.parse(stored) : {};
        // Only auto-switch if the user has never explicitly chosen
        if (!info[THEME_FIELD]) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      } catch {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return { theme, toggleTheme, setTheme };
};
