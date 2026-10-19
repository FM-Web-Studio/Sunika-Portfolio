import { useEffect } from 'react';
import Lenis from 'lenis';

let instance = null;

export const scrollToTarget = (target, options = {}) => {
  if (instance) {
    instance.scrollTo(target, { offset: -80, ...options });
    return;
  }
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: options.immediate ? 'auto' : 'smooth' });
    return;
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top, behavior: options.immediate ? 'auto' : 'smooth' });
};

export const useMomentumScroll = (enabled) => {
  useEffect(() => {
    if (!enabled) return undefined;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
    instance = lenis;
    let frame = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(loop);
    });
    const resize = new ResizeObserver(() => lenis.resize());
    resize.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      lenis.destroy();
      if (instance === lenis) instance = null;
    };
  }, [enabled]);
};
