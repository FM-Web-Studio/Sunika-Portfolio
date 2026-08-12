import { useEffect } from 'react';

// ─── HOOK ────────────────────────────────────────────────────────────────────
// Scroll-reveal: elements marked [data-reveal] fade + rise into place as they
// enter the viewport. Pairs with the [data-reveal] CSS in Theme.css.
//
//  • Pass a deps array so it re-scans when content changes (e.g. after data
//    loads or filters change) and observes any freshly-rendered elements.
//  • Honours reduced motion / the in-app Motion toggle by revealing everything
//    immediately (no observer, no animation).
export const useReveal = (deps = []) => {
  useEffect(() => {
    const root = document.documentElement;
    const reduce =
      root.getAttribute('data-no-animations') === 'true' ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      document
        .querySelectorAll('[data-reveal]:not(.is-revealed)')
        .forEach((el) => el.classList.add('is-revealed'));
      return undefined;
    }

    const targets = document.querySelectorAll('[data-reveal]:not(.is-revealed)');
    if (!targets.length) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
