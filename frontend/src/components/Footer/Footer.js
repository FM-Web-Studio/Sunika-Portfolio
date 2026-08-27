import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../../context/ContentContext';
import { subscribeContact, DEFAULT_CONTACT } from '../../firebase';
import styles from './Footer.module.css';

const NAV = [
  { label: 'Home',     to: '/'         },
  { label: 'Projects', to: '/projects' },
  { label: 'Gallery',  to: '/gallery'  },
  { label: 'Contact',  to: '/contact'  },
];

const Footer = () => {
  const { copy } = useContent();
  const brand = copy('brand');

  // Contact details + socials come from settings/contact.
  const [info, setInfo] = useState({ ...DEFAULT_CONTACT, socials: [] });
  useEffect(() => subscribeContact(setInfo, () => {}), []);

  const socials = (info.socials || []).filter((s) => s.url).map((s) => ({ label: s.label, href: s.url }));

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Link to="/" className={styles.logo} aria-label={brand.brandName}>
            <img src="/logo-wordmark.png" alt={brand.brandName} className={styles.logoImg} />
          </Link>
          <p className={styles.tagline}>{brand.footerTagline}</p>
          {(info.email || info.phone || info.location) && (
            <p className={styles.contactLine}>
              {[
                info.email && <a key="email" href={`mailto:${info.email}`}>{info.email}</a>,
                info.phone && <a key="phone" href={`tel:${info.phone.replace(/\s/g, '')}`}>{info.phone}</a>,
                info.location && <span key="loc">{info.location}</span>,
              ].filter(Boolean).reduce((acc, node, i) => (i === 0 ? [node] : [...acc, ' · ', node]), [])}
            </p>
          )}
        </div>

        <nav className={styles.nav} aria-label="Footer navigation">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={styles.navLink}>{n.label}</Link>
          ))}
          {socials.map((s) => (
            <a key={s.label} href={s.href} className={styles.navLink} target="_blank" rel="noopener noreferrer">{s.label}</a>
          ))}
        </nav>

        <p className={styles.copy}>
          {'©'} {new Date().getFullYear()} {brand.brandName}
          <span className={styles.note}>{brand.footerNote}</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
