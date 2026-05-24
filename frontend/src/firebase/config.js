// Static configuration shared across the portfolio data layer.

// This project's Firestore + Storage are shared with the Sunika gallery app.
// Portfolio resources live in their own collections / Storage folder.
export const COLLECTIONS = {
  projects:   'portfolio_projects',
  education:  'education',
  experience: 'experience',
  portfolio:  'portfolio',          // single-doc settings (see PORTFOLIO_DOCS)
  messages:   'portfolio_messages',
};

// Document ids inside the `portfolio` collection.
export const PORTFOLIO_DOCS = {
  personal:  'personal',
  contact:   'contact',
  interests: 'interests',
  skills:    'skills',
  socials:   'socials',
};

// Storage folder for all portfolio files (projects/, profile/).
export const STORAGE_PREFIX = 'portfolio';

// Comma-separated allowlist of admin Google account emails (client-side UX gate).
// Real enforcement lives in firestore.rules / storage.rules (managed separately).
export const ADMIN_EMAILS = (process.env.REACT_APP_ADMIN_EMAILS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

// Known social platform keys → used to pick an icon in SocialLinks.
export const SOCIAL_KEYS = ['instagram', 'linkedin', 'facebook', 'behance', 'dribbble', 'tiktok', 'whatsapp', 'email'];

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

export const DEFAULT_INTERESTS = { items: [] };

export const DEFAULT_SKILLS = { categories: [] };    // [{ name, items: [] }]

export const DEFAULT_SOCIALS = { platforms: [] };    // [{ key, platform, url }]
