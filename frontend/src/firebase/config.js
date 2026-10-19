export const COLLECTIONS = {
  projects: 'projects',
  accomplishments: 'accomplishments',
  experience: 'experience',
  education: 'education',
  profile: 'profile',
  messages: 'portfolioMessages',
  settings: 'settings',
};

export const SETTINGS_DOCS = {
  content: 'portfolioContent',
  contact: 'contact',
};

export const PROFILE_DOCS = {
  personal: 'personal',
  interests: 'interests',
  skills: 'skills',
  cvPhoto: 'cvPhoto',
};

export const STORAGE_FOLDERS = {
  projects: 'projects',
  accomplishments: 'accomplishments',
  profile: 'profile',
};

export const ADMIN_EMAILS = (import.meta.env.ADMIN_EMAILS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export const SOCIAL_KEYS = ['instagram', 'behance', 'dribbble', 'linkedin', 'facebook', 'tiktok', 'pinterest', 'whatsapp', 'website', 'email'];
