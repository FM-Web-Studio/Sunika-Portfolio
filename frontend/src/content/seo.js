// The title, description and link preview for every page.
// vite.config.js writes one HTML file per page from this list, so WhatsApp, LinkedIn,
// Facebook and search engines see the right preview without running the app.
// usePageMeta keeps the same title and canonical link after in-app navigation.

// The address search engines should credit. The same pages are also served on
// sunika-studio.firebaseapp.com, and the canonical link keeps them from counting twice.
export const SITE_URL = 'https://sunika-studio.web.app';
export const SITE_NAME = 'Sunika Lombard';
const HOME_TITLE = `${SITE_NAME} | Communication Design and Illustration`;

// Hosting caches images for a year, so a changed preview image needs a NEW file name.
export const SHARE_IMAGE = '/og/share.jpg';
export const SHARE_ALT = 'The Eye Candy Design logo beside the words Sunika Lombard, communication design and illustration';

export const titleFor = (title) => (title ? `${title} | ${SITE_NAME}` : HOME_TITLE);

export const PAGE_META = [
  {
    path: '/',
    file: 'index.html',
    title: HOME_TITLE,
    description: 'Sunika Lombard, communication designer and illustrator. Selected projects, experience and studies, with a downloadable CV.',
  },
  {
    path: '/projects',
    file: 'projects.html',
    title: titleFor('Projects'),
    description: 'Communication design and illustration projects by Sunika Lombard.',
  },
  {
    path: '/contact',
    file: 'contact.html',
    title: titleFor('Contact'),
    description: 'Get in touch with Sunika Lombard about design or illustration work.',
  },
  {
    path: '/privacy',
    file: 'privacy.html',
    title: titleFor('Privacy policy'),
    description: 'What this site collects, why, how long it is kept, and your rights under POPIA and the GDPR.',
  },
  {
    path: '/terms',
    file: 'terms.html',
    title: titleFor('Terms of use'),
    description: 'The terms for using this site: ownership of the work, acceptable use, liability and governing law.',
  },
];

// Pages that must never be indexed. They still get their own file so the noindex is in the HTML.
export const PRIVATE_META = [
  { path: '/admin', file: 'admin.html', title: titleFor('Admin'), noindex: true },
];

export const NOT_FOUND_META = { file: '404.html', title: titleFor('Page not found'), noindex: true };

export const absoluteUrl = (path) => new URL(path, SITE_URL).href;

export const PERSON_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: SITE_NAME,
  url: SITE_URL,
  image: absoluteUrl('/brand-wordmark.png'),
  jobTitle: 'Communication Designer and Illustrator',
  address: { '@type': 'PostalAddress', addressCountry: 'ZA' },
};
