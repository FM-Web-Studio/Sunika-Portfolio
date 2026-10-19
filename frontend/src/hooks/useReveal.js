import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useReveal = (deps = []) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const items = [...document.querySelectorAll('[data-reveal]:not(.is-in)')];
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname, ...deps]);
};
