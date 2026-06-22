import { useState, useEffect, useRef } from 'react';

// ─── REDUCED MOTION CHECK ─────────────────────────────────────────────────────
// Honors both the app's manual toggle (data-no-animations) and the OS setting.
const prefersReduced = () =>
  document.documentElement.getAttribute('data-no-animations') === 'true' ||
  (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

// ─── useReveal ────────────────────────────────────────────────────────────────
// Returns [ref, inView]. Attach ref to an element; inView flips true once it
// scrolls into the viewport. When motion is reduced (or IO is unavailable) the
// element starts revealed so nothing is ever hidden.
export const useReveal = ({
  threshold = 0.15,
  rootMargin = '0px 0px -8% 0px',
  once = true,
} = {}) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (prefersReduced() || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        });
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, inView];
};
