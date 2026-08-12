// Static configuration shared across the data layer.

export const COLLECTIONS = {
  artworks:   'artworks',
  projects:   'projects',
  education:  'education',
  experience: 'experience',
  profile:    'profile',     // single-doc profile settings (see PROFILE_DOCS)
  messages:   'messages',    // contact-form submissions
};

// Single documents in the `settings` collection.
export const SETTINGS_DOCS = {
  content: 'content',   // editable site copy, one group per page
  contact: 'contact',   // email / phone / location + social links
};

// Document ids inside the `profile` collection.
export const PROFILE_DOCS = {
  personal:  'personal',
  interests: 'interests',
  skills:    'skills',
};

// Storage folders, one per collection that owns files. Matched by prefix in
// storage.rules, so a new folder needs a matching rule.
export const STORAGE_FOLDERS = {
  artworks: 'artworks',
  projects: 'projects',
  profile:  'profile',
};

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
