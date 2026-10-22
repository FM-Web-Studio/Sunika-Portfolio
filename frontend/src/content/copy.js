const field = (key, label, def, type = 'text') => ({ key, label, default: def, type });

export const COPY_SCHEMA = [
  {
    key: 'brand',
    label: 'Brand and footer',
    fields: [
      field('brandName', 'Brand name', 'Suni Designs'),
      field('motto', 'Motto', 'create . inspire . mark leaving'),
      field('footerTagline', 'Footer line', 'Communication design and illustration by Sunika Lombard.', 'textarea'),
      field('galleryUrl', 'Gallery site link (leave blank to hide)', ''),
      field('galleryLabel', 'Gallery site label', 'Gallery'),
    ],
  },
  {
    key: 'home',
    label: 'Home page',
    fields: [
      field('heroCta', 'Hero: projects button', 'View projects'),
      field('workTitle', 'Work: title', 'Selected work'),
      field('workAll', 'Work: link to all projects', 'All projects'),
      field('workEmpty', 'Work: shown when empty', 'No projects yet.'),
      field('aboutTitle', 'About: title', 'About'),
      field('winsLabel', 'Highlights: title', 'Highlights'),
      field('makingKicker', 'About: skills label', 'Skills'),
      field('interestsLabel', 'About: interests label', 'Interests'),
      field('journeyTitle', 'Timeline: title', 'Experience and education'),
      field('journeyExpLabel', 'Timeline: experience label', 'Experience'),
      field('journeyEduLabel', 'Timeline: education label', 'Education'),
      field('contactTitle', 'Bottom band: title', 'Get in touch'),
      field('contactCta', 'Bottom band: button', 'Send a message'),
    ],
  },
  {
    key: 'projects',
    label: 'Projects page',
    fields: [
      field('heading', 'Title', 'Projects'),
      field('subtitle', 'Subtitle', 'Select a project to see all of its images.', 'textarea'),
      field('allLabel', 'Filter: show everything', 'All'),
      field('emptyText', 'Shown when empty', 'No projects yet.'),
      field('errorText', 'Shown on an error', 'Projects could not be loaded. Please refresh the page.'),
    ],
  },
  {
    key: 'contactPage',
    label: 'Contact page',
    fields: [
      field('heading', 'Title', 'Contact'),
      field('subtitle', 'Subtitle', 'Use the form or reach me directly.', 'textarea'),
      field('formLabel', 'Form: title', 'Send a message'),
      field('sendLabel', 'Form: button', 'Send'),
      field('sentText', 'Form: after sending', 'Thank you, your message has been sent.'),
      field('socialLabel', 'Links: title', 'Online'),
    ],
  },
  {
    key: 'cv',
    label: 'CV download',
    fields: [
      field('button', 'Button label', 'Download CV'),
      field('busy', 'Button while preparing', 'Preparing CV'),
      field('failed', 'Shown if it fails', 'The CV could not be created. Please try again.'),
      field('portfolioUrl', 'Portfolio link printed on the CV', 'https://sunika-studio.web.app'),
      field('profile', 'Section: profile', 'Profile'),
      field('experience', 'Section: experience', 'Experience'),
      field('education', 'Section: education', 'Education'),
      field('highlights', 'Section: awards', 'Awards and recognition'),
      field('skills', 'Section: skills', 'Skills'),
      field('portfolio', 'Section: portfolio', 'Portfolio'),
      field('scan', 'Portfolio: under the QR code', 'Scan to see my work'),
      field('online', 'Section: online', 'Online'),
    ],
  },
];

export const resolveGroup = (fields = [], overrides = {}) => {
  const out = {};
  for (const f of fields) {
    const value = overrides?.[f.key];
    out[f.key] = typeof value === 'string' && value.trim() !== '' ? value : f.default;
  }
  return out;
};

export const resolveAll = (saved = {}) =>
  Object.fromEntries(COPY_SCHEMA.map((g) => [g.key, resolveGroup(g.fields, saved?.[g.key])]));

export const overridesOf = (draft = {}) =>
  Object.fromEntries(
    COPY_SCHEMA.map((g) => [
      g.key,
      Object.fromEntries(
        g.fields
          .map((f) => [f.key, (draft[g.key]?.[f.key] ?? '').trim()])
          .filter(([key, value]) => value !== '' && value !== g.fields.find((f) => f.key === key).default),
      ),
    ]),
  );
