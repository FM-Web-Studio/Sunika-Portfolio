import { useEffect } from 'react';
import Lenis from 'lenis';

// Single shared instance so navigation code can drive the same smooth scroller.
let lenisInstance = null;
export const getLenis = () => lenisInstance;

const prefersReduced = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Momentum scrolling via Lenis, the site's single piece of ambient motion.
 * Desktop: smooths the wheel for weighty, inertial scrolling.
 * Touch: left on native scroll so mobile keeps its own momentum.
 * Disabled entirely when the visitor prefers reduced motion.
 *
 * lerp 0.09 with a neutral wheel multiplier reads as weight rather than drift;
 * the previous 1.25x multiplier overshot the cursor and felt slippery.
 */
export default function useMomentumScroll() {
  useEffect(() => {
    if (typeof window === 'undefined' || prefersReduced()) return undefined;

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });
    lenisInstance = lenis;

    let rafId = 0;
    const raf = (time) => { lenis.raf(time); rafId = requestAnimationFrame(raf); };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      if (lenisInstance === lenis) lenisInstance = null;
    };
  }, []);
}
