import React from 'react';
import {
  FaInstagram, FaFacebookF, FaWhatsapp, FaTiktok, FaEnvelope,
  FaLinkedinIn, FaBehance, FaDribbble, FaLink,
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
};

// Accepts the portfolio shape { key, platform, url } as well as the legacy
// { type, label, href } shape.
const normalise = (s) => ({
  key:   (s.key ?? s.type ?? '').toLowerCase(),
  label: s.platform ?? s.label ?? s.key ?? '',
  href:  s.url ?? s.href ?? '',
});

const SocialLinks = ({ socials = [] }) => (
  <div className={styles.links}>
    {socials.map(normalise).filter((s) => s.href).map(({ key, label, href }) => {
      const Icon = ICONS[key] || FaLink;
      const isEmail = key === 'email' || href.startsWith('mailto:');
      return (
        <a
          key={label || href}
          href={href}
          className={styles.link}
          aria-label={label}
          {...(isEmail ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
        >
          <Icon aria-hidden="true" />
          <span>{label}</span>
        </a>
      );
    })}
  </div>
);

export default SocialLinks;
