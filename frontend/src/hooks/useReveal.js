import { useEffect } from 'react';

// ─── HOOK ────────────────────────────────────────────────────────────────────
// Scroll-reveal: elements marked [data-reveal] fade + rise into place as they
// enter the viewport. Pairs with the [data-reveal] CSS in Theme.css.
//
// WARNING, and it has already cost one bug: [data-reveal] starts at `opacity: 0`,
// and ONLY this hook ever clears it. Render a [data-reveal] element on a page that
// does not call useReveal and the element is in the DOM, occupying layout, and
// permanently invisible with no error anywhere. That is how the home page ended up
// with a "What people say" heading above an empty space while the reviews underneath
// it were loading perfectly.
//
// So: a component must not set [data-reveal] on its own initiative. It takes a prop
// and the page decides, because only the page knows whether this hook is running.
// See the `reveal` prop on ReviewCard.
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
