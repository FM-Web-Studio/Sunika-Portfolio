// Static configuration shared across the portfolio data layer.

// This project's Firestore + Storage are shared with the Sunika gallery app.
// Portfolio resources live in their own consistently prefixed collections.
// Contact details + social links are NOT portfolio specific: they live in the
// cross-app settings/shared document (see firebase/shared.js) so both Sunika
// sites read and edit one source of truth.
export const COLLECTIONS = {
  projects:   'portfolio_projects',
  education:  'portfolio_education',
  experience: 'portfolio_experience',
  profile:    'portfolio_profile',   // single-doc profile settings (see PROFILE_DOCS)
  messages:   'portfolio_messages',
};

// Document ids inside the `portfolio_profile` collection.
export const PROFILE_DOCS = {
  personal:  'personal',
  interests: 'interests',
  skills:    'skills',
};

// Storage folder for all portfolio files (projects/, profile/).
export const STORAGE_PREFIX = 'portfolio';

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

export const DEFAULT_SOCIALS = { platforms: [] };    // [{ key, platform, url }]
