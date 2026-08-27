// Static configuration shared across the data layer.
//
// The portfolio and the gallery are two separate sites sharing ONE Firebase
// project, so every name here is picked so that it has exactly one owner.
//
// A collection only this site touches keeps its plain name (`projects`, and the
// `projects/` folder in Storage). Anything both sites would otherwise have wanted
// to call the same thing, the contact details, the editable copy, the contact-form
// inbox, carries a `portfolio` prefix, because the gallery holds its own copy of
// each of those and the two must never overwrite one another.
//
// The gallery's own names are `artworks`, `galleryMessages`,
// `settings/galleryContent` and `settings/galleryContact`. Nothing in this repo
// should ever read them.

export const COLLECTIONS = {
  projects:        'projects',
  education:       'education',
  experience:      'experience',
  profile:         'profile',            // single-doc profile settings (see PROFILE_DOCS)
  messages:        'portfolioMessages',  // contact-form submissions from THIS site
  accomplishments: 'accomplishments',    // wins / features shown in the About section
};

// Single documents in the `settings` collection, this site's half of it.
export const SETTINGS_DOCS = {
  content: 'portfolioContent',   // editable site copy, one group per page
  contact: 'portfolioContact',   // email / phone / location + social links
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
  projects:        'projects',
  profile:         'profile',
  accomplishments: 'accomplishments',
};

// Comma-separated allowlist of admin Google account emails (client-side UX gate).
// Real enforcement lives in firestore.rules / storage.rules, which are deployed
// from this repo and cover both sites.
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
