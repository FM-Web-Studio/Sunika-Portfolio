import { useEffect } from 'react';
import Lenis from 'lenis';

// Single shared instance so navigation code can drive the same smooth scroller.
let lenisInstance = null;
export const getLenis = () => lenisInstance;

const prefersReduced = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The in-app Motion toggle (Settings cog) sets this on <html>.
const motionDisabled = () =>
  document.documentElement.getAttribute('data-no-animations') === 'true';

/**
 * Momentum scrolling via Lenis, the site's single piece of ambient motion.
 * Desktop: smooths the wheel for weighty, inertial scrolling.
 * Touch: left on native scroll so mobile keeps its own momentum.
 * Disabled entirely under reduced motion or the in-app Motion toggle.
 *
 * lerp 0.09 with a neutral wheel multiplier reads as weight rather than drift;
 * an earlier 1.25x multiplier overshot the cursor and felt slippery.
 */
export default function useMomentumScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let lenis = null;
    let rafId = 0;
    let resizeObserver = null;

    const start = () => {
      if (lenis) return;
      lenis = new Lenis({
        lerp: 0.09,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.4,
      });
      lenisInstance = lenis;

      const raf = (time) => { lenis.raf(time); rafId = requestAnimationFrame(raf); };
      rafId = requestAnimationFrame(raf);

      /* Lenis caches the scrollable height, and these pages load content after first
         paint, so the document grows while someone is already scrolling. Against a
         stale height Lenis clamps to the wrong maximum, which feels like hitting an
         invisible wall and springing back. Re-measure on resize. */
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => lenis?.resize());
        resizeObserver.observe(document.body);
      }
    };

    const stop = () => {
      if (!lenis) return;
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      resizeObserver = null;
      lenis.destroy();
      if (lenisInstance === lenis) lenisInstance = null;
      lenis = null;
    };

    const sync = () => {
      if (prefersReduced() || motionDisabled()) stop();
      else start();
    };

    sync();

    // React to the Motion toggle without needing a reload.
    const attrObserver = new MutationObserver(sync);
    attrObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-no-animations'],
    });

    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    mq?.addEventListener('change', sync);

    return () => {
      attrObserver.disconnect();
      mq?.removeEventListener('change', sync);
      stop();
    };
  }, []);
}
