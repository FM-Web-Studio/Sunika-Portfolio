import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readPrefs, writePrefs } from '../lib/storage';

const PrefsContext = createContext(null);

const media = (query) => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query) : null);

const initialTheme = () => {
  const saved = readPrefs().theme;
  if (saved === 'dark' || saved === 'light') return saved;
  return media('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
};

const initialMotion = () => {
  const saved = readPrefs().reduceMotion;
  if (typeof saved === 'boolean') return saved;
  return !!media('(prefers-reduced-motion: reduce)')?.matches;
};

export const PrefsProvider = ({ children }) => {
  const [theme, setTheme] = useState(initialTheme);
  const [reduceMotion, setReduceMotion] = useState(initialMotion);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.motion = reduceMotion ? 'reduced' : 'full';
  }, [reduceMotion]);

  useEffect(() => {
    const dark = media('(prefers-color-scheme: dark)');
    const still = media('(prefers-reduced-motion: reduce)');
    const onDark = (e) => { if (!readPrefs().theme) setTheme(e.matches ? 'dark' : 'light'); };
    const onStill = (e) => { if (typeof readPrefs().reduceMotion !== 'boolean') setReduceMotion(e.matches); };
    dark?.addEventListener('change', onDark);
    still?.addEventListener('change', onStill);
    return () => {
      dark?.removeEventListener('change', onDark);
      still?.removeEventListener('change', onStill);
    };
  }, []);

  const toggleTheme = useCallback(() => setTheme((t) => {
    const next = t === 'dark' ? 'light' : 'dark';
    writePrefs({ theme: next });
    return next;
  }), []);

  const toggleMotion = useCallback(() => setReduceMotion((r) => {
    writePrefs({ reduceMotion: !r });
    return !r;
  }), []);

  const value = useMemo(() => ({ theme, toggleTheme, reduceMotion, toggleMotion }), [theme, toggleTheme, reduceMotion, toggleMotion]);

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
};

export const usePrefs = () => useContext(PrefsContext);
