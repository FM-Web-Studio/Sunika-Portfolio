// Static configuration for the data layer.
//
// The portfolio and the gallery are two sites in one Firebase project. The prefix
// marks ownership: `portfolio` means this site owns it, no prefix means shared.
//
//   shared     settings/contact, one email / phone / set of socials for both sites
//   portfolio  projects, education, experience, profile, accomplishments,
//              portfolioMessages, settings/portfolioContent
//   gallery    artworks, galleryMessages, settings/galleryContent, never read here

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
  contact: 'contact',            // SHARED with the gallery, see the note above
};

// Document ids inside the `profile` collection.
export const PROFILE_DOCS = {
  personal:  'personal',
  interests: 'interests',
  skills:    'skills',
};

// Matched by prefix in storage.rules, so a new folder needs a matching rule.
export const STORAGE_FOLDERS = {
  projects:        'projects',
  profile:         'profile',
  accomplishments: 'accomplishments',
};

// Client-side UX gate only. Real enforcement is in firestore.rules / storage.rules,
// which are deployed from this repo and cover both sites.
export const ADMIN_EMAILS = (import.meta.env.ADMIN_EMAILS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

// Known social platform keys -> used to pick an icon in SocialLinks.
export const SOCIAL_KEYS = ['instagram', 'linkedin', 'facebook', 'behance', 'dribbble', 'tiktok', 'whatsapp', 'website', 'email'];

// Fallbacks when a document is missing, and seeds for the admin forms.
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
