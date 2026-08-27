/**
 * Editable site copy. Every visitor-facing string lives here with its `default`, and
 * only values an admin changes are stored in Firestore (settings/portfolioContent),
 * so code stays the source of truth for anything untouched.
 *
 * DECORATION BELONGS IN THESE STRINGS, never beside them in the JSX, or an admin can
 * edit the words but not the glyph next to them. The defaults are plain text on
 * purpose. Keep them that way.
 */

// Brand / footer
export const BRAND_FIELDS = [
  { key: 'brandName',     label: 'Brand name',     type: 'text',     default: 'Sunika' },
  { key: 'footerTagline', label: 'Footer tagline', type: 'textarea', default: 'Design and illustration, made with heart.' },
  { key: 'footerNote',    label: 'Footer note',    type: 'text',     default: 'Made with love' },

  /* The gallery site. A copy field rather than a constant so moving that site does
     not need a redeploy of this one. Blank means the link does not render. */
  { key: 'galleryUrl',   label: 'Gallery site: URL',   type: 'text', default: '' },
  { key: 'galleryLabel', label: 'Gallery site: label', type: 'text', default: 'The Gallery' },
];

// Home page
export const HOME_FIELDS = [
  { key: 'heroEyebrow',    label: 'Hero: greeting',        type: 'text',     default: 'Hi there!' },

  { key: 'makingKicker',   label: 'Craft: kicker',         type: 'text',     default: 'What I love making' },
  { key: 'makingTitle',    label: 'Craft: title',          type: 'text',     default: 'I turn ideas into happy things.' },

  { key: 'workKicker',     label: 'Work: kicker',          type: 'text',     default: 'Recent favourites' },
  { key: 'workTitle',      label: 'Work: title',           type: 'text',     default: "A few things I'm proud of." },
  { key: 'workViewOne',    label: 'Work: per-project link', type: 'text',    default: 'Take a closer look' },
  { key: 'workEmpty',      label: 'Work: empty note',      type: 'text',     default: 'Projects are on their way, check back soon.' },

  { key: 'aboutKicker',    label: 'About: kicker',         type: 'text',     default: 'A little about me' },
  { key: 'aboutTitle',     label: 'About: title',          type: 'text',     default: 'Nice to meet you!' },
  { key: 'aboutNote',      label: 'About: note',           type: 'textarea', default: 'A few of the things that keep me curious and inspired' },
  { key: 'interestsLabel', label: 'About: interests label', type: 'text',    default: 'Things I love' },

  { key: 'winsLabel',      label: 'About: wins label',     type: 'text',     default: 'Recent highlights' },
  { key: 'winsNote',       label: 'About: wins note',      type: 'textarea', default: 'Moments I am proud of.' },

  { key: 'journeyKicker',  label: 'Journey: kicker',       type: 'text',     default: 'My path so far' },
  { key: 'journeyTitle',   label: 'Journey: title',        type: 'text',     default: 'How I got here.' },
  { key: 'journeyExpLabel', label: 'Journey: experience label', type: 'text', default: 'Experience' },
  { key: 'journeyEduLabel', label: 'Journey: education label',  type: 'text', default: 'Education' },

  { key: 'contactEyebrow', label: 'Contact: eyebrow',      type: 'text',     default: "Let's talk" },
  { key: 'contactTitle',   label: 'Contact: title',        type: 'text',     default: "Let's make something lovely together." },
  { key: 'contactCta',     label: 'Contact: button',       type: 'text',     default: 'Say hello' },
  { key: 'backTop',        label: 'Contact: back to top',  type: 'text',     default: 'Back to top' },
];

// Projects (work) page
export const PROJECTS_FIELDS = [
  { key: 'kicker',    label: 'Header: kicker',    type: 'text',     default: 'The Portfolio' },
  { key: 'heading',   label: 'Header: title',     type: 'text',     default: 'Projects' },
  { key: 'subtitle',  label: 'Header: subtitle',  type: 'textarea', default: 'A selection of design and illustration work, tap any piece to take a closer look.' },
  { key: 'emptyText', label: 'Empty state',       type: 'text',     default: 'No projects to show yet.' },
  { key: 'errorText', label: 'Error state',       type: 'text',     default: 'Something went wrong loading projects.' },
];

// Contact page copy
export const CONTACT_PAGE_FIELDS = [
  { key: 'kicker',      label: 'Header: kicker',    type: 'text',     default: 'Say hello' },
  { key: 'heading',     label: 'Header: title',     type: 'text',     default: "Let's work together" },
  { key: 'subtitle',    label: 'Header: subtitle',  type: 'textarea', default: 'Interested in collaborating or have a question? Drop a message below or find me online.' },
  { key: 'formLabel',   label: 'Form: label',       type: 'text',     default: 'Send a message' },
  { key: 'socialLabel', label: 'Socials: label',    type: 'text',     default: 'Find me online' },
];

// Tabs in the admin "Site Copy" editor. Contact details and social links are edited
// separately, backed by settings/contact.
export const COPY_SCHEMA = [
  { key: 'brand',       label: 'Brand & Footer', fields: BRAND_FIELDS },
  { key: 'home',        label: 'Home',           fields: HOME_FIELDS },
  { key: 'projects',    label: 'Projects',       fields: PROJECTS_FIELDS },
  { key: 'contactPage', label: 'Contact page',   fields: CONTACT_PAGE_FIELDS },
];

// Every group's field list, keyed by group. Used by pages to resolve copy.
export const GROUP_FIELDS = {
  brand:       BRAND_FIELDS,
  home:        HOME_FIELDS,
  projects:    PROJECTS_FIELDS,
  contactPage: CONTACT_PAGE_FIELDS,
};

/**
 * Overlay saved overrides onto the in-code defaults. An empty or whitespace-only
 * override falls back to the default so the page never renders blank.
 */
export const resolveGroup = (fields = [], overrides = {}) => {
  const out = {};
  for (const f of fields) {
    const ov = overrides?.[f.key];
    out[f.key] = (typeof ov === 'string' && ov.trim() !== '') ? ov : f.default;
  }
  return out;
};
