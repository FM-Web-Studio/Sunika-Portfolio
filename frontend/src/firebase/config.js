// Static configuration shared across the data layer.

export const COLLECTIONS = {
  artworks:        'artworks',
  projects:        'projects',
  education:       'education',
  experience:      'experience',
  profile:         'profile',         // single-doc profile settings (see PROFILE_DOCS)
  messages:        'messages',        // contact-form submissions
  accomplishments: 'accomplishments', // wins / features shown in the About section
  reviews:         'reviews',         // visitor-written reviews, moderated
  reviewComments:  'review_comments', // replies, flat with a reviewId field (see reviews.js)
};

// Per-visitor vote records, kept as subcollections of the artwork they belong to
// and keyed by the visitor's anonymous auth uid. They are what makes one-vote-
// per-visitor enforceable in firestore.rules rather than a localStorage promise.
export const ARTWORK_VOTES = {
  raters: 'raters',
  likers: 'likers',
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
  artworks:        'artworks',
  projects:        'projects',
  profile:         'profile',
  accomplishments: 'accomplishments',
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


// ── Reviews ──────────────────────────────────────────────────────────────────
// Kept in sync with the size checks in firestore.rules. The form should stop
// people before the server does, but the server is what actually enforces it.
export const REVIEW_LIMITS = {
  authorName: { min: 2,  max: 60 },
  title:      { max: 100 },
  body:       { min: 10, max: 2000 },
  comment:    { min: 2,  max: 700 },
  role:       { max: 80 },
};

// What the reviewer says the work was for. Free text is allowed too; these are
// only the quick picks in the form.
export const REVIEW_SUBJECTS = ['Illustration', 'Branding', 'Commission', 'Print design', 'Original artwork', 'Other'];

export const REVIEW_SORTS = [
  { key: 'newest',  label: 'Newest' },
  { key: 'highest', label: 'Highest rated' },
  { key: 'lowest',  label: 'Lowest rated' },
  { key: 'liked',   label: 'Most liked' },
];

// One browser may post a review at most this often. A soft client-side guard;
// moderation is the real defence (see reviews.js).
export const REVIEW_COOLDOWN_MS = 5 * 60 * 1000;

// ── Gallery ──────────────────────────────────────────────────────────────────
export const CATEGORIES = ['Paintings', 'Drawings', 'Artistic Mix'];

export const CURRENCY_SYMBOL = 'R';

export const formatPrice = (price) => {
  const n = Number(price);
  if (!price || Number.isNaN(n) || n === 0) return 'Price on request';
  return `${CURRENCY_SYMBOL}${n.toLocaleString()}`;
};
