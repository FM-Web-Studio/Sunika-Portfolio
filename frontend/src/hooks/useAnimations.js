import { useState, useEffect } from 'react';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const STORAGE_KEY      = 'userSessionInfo';
const ANIMATIONS_FIELD = 'reduceAnimations';

// ─── INITIAL VALUE ────────────────────────────────────────────────────────────
// Reads stored preference; falls back to OS prefers-reduced-motion.
export const getInitialAnimations = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed[ANIMATIONS_FIELD] === 'boolean') {
        return parsed[ANIMATIONS_FIELD];
      }
    }
  } catch {
    // corrupted storage, fall through to system preference
  }

  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
};

// ─── HOOK ────────────────────────────────────────────────────────────────────
// Manages reduce-animations state, syncs DOM attribute and persists to storage.
export const useAnimations = () => {
  const [reduceAnimations, setReduceAnimations] = useState(getInitialAnimations);

  // ─── DOM SYNC ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;

    if (reduceAnimations) {
      root.setAttribute('data-no-animations', 'true');
    } else {
      root.removeAttribute('data-no-animations');
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const info   = stored ? JSON.parse(stored) : {};
      info[ANIMATIONS_FIELD] = reduceAnimations;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    } catch {
      // storage unavailable, DOM attribute is still updated
    }
  }, [reduceAnimations]);

  // ─── OS PREFERENCE LISTENER ─────────────────────────────────────────────────
  // Only auto-switches when the user has no explicit stored preference.
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;

    const handleChange = (e) => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const info   = stored ? JSON.parse(stored) : {};
        if (typeof info[ANIMATIONS_FIELD] !== 'boolean') {
          setReduceAnimations(e.matches);
        }
      } catch {
        setReduceAnimations(e.matches);
      }
    };

    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  const toggleAnimations = () => setReduceAnimations((prev) => !prev);

  return { reduceAnimations, toggleAnimations };
};
