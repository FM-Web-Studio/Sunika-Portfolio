// Static configuration shared across the data layer.

// Collection names carry a `gallery_` / `portfolio_` prefix. It is a namespace,
// not a separate site: `gallery_*` is the artwork side, `portfolio_*` the rest,
// and `settings/*` holds the documents both sides read.
export const COLLECTIONS = {
  projects:   'portfolio_projects',
  education:  'portfolio_education',
  experience: 'portfolio_experience',
  profile:    'portfolio_profile',   // single-doc profile settings (see PROFILE_DOCS)
  messages:   'portfolio_messages',  // the site's one contact form
  artworks:   'gallery_artworks',
};

// Document ids inside the `portfolio_profile` collection.
export const PROFILE_DOCS = {
  personal:  'personal',
  interests: 'interests',
  skills:    'skills',
};

// Storage folders. Both are matched by prefix in storage.rules.
export const STORAGE_PREFIX = 'portfolio';   // projects/, profile/
export const ARTWORK_STORAGE_PREFIX = 'gallery';   // artworks/

// Comma-separated allowlist of admin Google account emails (client-side UX gate).
// Real enforcement lives in firestore.rules / storage.rules (managed separately).
export const ADMIN_EMAILS = (import.meta.env.ADMIN_EMAILS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

// Known social platform keys → used to pick an icon in SocialLinks.
export const SOCIAL_KEYS = ['instagram', 'linkedin', 'facebook', 'behance', 'dribbble', 'tiktok', 'whatsapp', 'website', 'email'];

// ── Defaults ─────────────────────────────────────────────────────────────────
// Used as fallbacks when a portfolio doc is missing, and to seed admin forms.
export const DEFAULT_PERSONAL = {
  name:     '',
  title:    '',
  bio:      '',
  photoUrl: '',
  email:    '',
  location: '',
  phone:    '',
};

export const DEFAULT_CONTACT = {
  email:    '',
  phone:    '',
  location: '',
};


// ── Gallery ──────────────────────────────────────────────────────────────────
export const CATEGORIES = ['Paintings', 'Drawings', 'Artistic Mix'];

export const CURRENCY_SYMBOL = 'R';

export const formatPrice = (price) => {
  const n = Number(price);
  if (!price || Number.isNaN(n) || n === 0) return 'Price on request';
  return `${CURRENCY_SYMBOL}${n.toLocaleString()}`;
};
