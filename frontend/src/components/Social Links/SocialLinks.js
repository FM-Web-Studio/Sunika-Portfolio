import React from 'react';
import {
  FaInstagram, FaFacebookF, FaWhatsapp, FaTiktok, FaEnvelope,
  FaLinkedinIn, FaBehance, FaDribbble, FaGlobe, FaLink,
} from 'react-icons/fa';
import styles from './SocialLinks.module.css';

const ICONS = {
  instagram: FaInstagram,
  facebook:  FaFacebookF,
  whatsapp:  FaWhatsapp,
  tiktok:    FaTiktok,
  linkedin:  FaLinkedinIn,
  behance:   FaBehance,
  dribbble:  FaDribbble,
  email:     FaEnvelope,
  website:   FaGlobe,
  site:      FaGlobe,
  web:       FaGlobe,
};

// Platforms whose handle reads naturally with an @ prefix.
const AT_STYLE = ['instagram', 'tiktok', 'twitter', 'x', 'threads', 'behance', 'dribbble'];

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

// Pull a human handle/username out of the URL so two accounts on the same
// platform (e.g. two Instagrams) are distinguishable.
const deriveHandle = (href, key) => {
  if (!href) return '';
  if (key === 'email' || href.startsWith('mailto:')) return href.replace(/^mailto:/, '');
  if (key === 'whatsapp' || href.startsWith('tel:')) return href.replace(/^tel:/, '');
  try {
    const u = new URL(href.includes('://') ? href : `https://${href}`);
    const host = u.hostname.replace(/^www\./, '');
    // A website's "handle" is its domain, not a path segment.
    if (['website', 'site', 'web'].includes(key)) return host;
    const segments = u.pathname.split('/').filter(Boolean);
    if (segments.length === 0) return host;
    const last = segments[segments.length - 1];
    return AT_STYLE.includes(key) ? `@${last}` : last;
  } catch {
    return href;
  }
};

// Accepts the portfolio shape { key, platform, url } as well as the legacy
// { type, label, href } shape.
const normalise = (s) => {
  const key = (s.key ?? s.type ?? '').toLowerCase();
  const href = s.url ?? s.href ?? '';
  return {
    key,
    name:   s.platform ?? s.label ?? (cap(key) || 'Link'),
    handle: deriveHandle(href, key),
    href,
  };
};

const SocialLinks = ({ socials = [] }) => (
  <div className={styles.links}>
    {socials.map(normalise).filter((s) => s.href).map(({ key, name, handle, href }) => {
      const Icon = ICONS[key] || FaLink;
      const isEmail = key === 'email' || href.startsWith('mailto:');
      const showHandle = handle && handle.toLowerCase() !== name.toLowerCase();
      return (
        <a
          key={href}
          href={href}
          className={styles.link}
          aria-label={showHandle ? `${name}, ${handle}` : name}
          {...(isEmail ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
        >
          <Icon className={styles.icon} aria-hidden="true" />
          <span className={styles.text}>
            <span className={styles.name}>{name}</span>
            {showHandle && <span className={styles.handle}>{handle}</span>}
          </span>
        </a>
      );
    })}
  </div>
);

export default SocialLinks;
