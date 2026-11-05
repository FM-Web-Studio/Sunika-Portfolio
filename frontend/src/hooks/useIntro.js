import { useEffect, useRef } from 'react';
import { useSite } from '../context/SiteContext';

const MIN_MS = 2300;
const MAX_MS = 5000;
const LIFT_MS = 1050;
const SKIP = ['pointerdown', 'keydown', 'wheel', 'touchstart'];

const playing = () => document.documentElement.dataset.intro === 'playing';

const lift = () => {
  if (!playing()) return;
  const root = document.documentElement;
  const el = document.getElementById('intro');
  root.dataset.intro = 'lifting';
  el?.classList.add('lift');
  setTimeout(() => {
    el?.remove();
    delete root.dataset.intro;
  }, LIFT_MS);
};

export const useIntro = () => {
  const { allReady } = useSite();
  const active = useRef(typeof document !== 'undefined' && playing());

  useEffect(() => {
    if (!active.current) return undefined;
    const cap = setTimeout(lift, Math.max(0, MAX_MS - performance.now()));
    SKIP.forEach((type) => window.addEventListener(type, lift, { passive: true }));
    return () => {
      clearTimeout(cap);
      SKIP.forEach((type) => window.removeEventListener(type, lift));
    };
  }, []);

  useEffect(() => {
    if (!active.current || !allReady) return undefined;
    const wait = setTimeout(lift, Math.max(0, MIN_MS - performance.now()));
    return () => clearTimeout(wait);
  }, [allReady]);
};
