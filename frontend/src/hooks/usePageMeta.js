import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// The address search engines should credit. The same pages are also served on
// sunika-studio.firebaseapp.com, and the canonical link keeps them from counting twice.
export const SITE_ORIGIN = 'https://sunika-studio.web.app';

const NAME = 'Sunika Lombard';

const headTag = (selector, create) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
};

export const usePageMeta = ({ title, noindex = false } = {}) => {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = title ? `${title} | ${NAME}` : `${NAME} | Communication Design and Illustration`;

    if (!noindex) {
      const canonical = headTag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }));
      canonical.href = SITE_ORIGIN + pathname;
      return undefined;
    }

    document.head.querySelector('link[rel="canonical"]')?.remove();
    const robots = headTag('meta[name="robots"]', () => Object.assign(document.createElement('meta'), { name: 'robots' }));
    robots.content = 'noindex';
    return () => robots.remove();
  }, [title, noindex, pathname]);
};
