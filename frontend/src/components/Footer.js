import { Link } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';
import { useSite } from '../context/SiteContext';
import { scrollToTarget } from '../hooks/useMomentumScroll';
import SocialLinks from './SocialLinks';
import { PAGES } from './Nav';
import styles from './Footer.module.css';

const Footer = () => {
  const { copy, contact } = useSite();
  const { brand } = copy;

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <button type="button" className={styles.logo} onClick={() => scrollToTarget(0)} aria-label="Back to top">
            <img src="/logo-wordmark.png" alt={brand.brandName} width="1100" height="585" />
          </button>
          <p>{brand.footerTagline}</p>
        </div>

        <nav className={styles.nav} aria-label="Footer">
          {PAGES.map((p) => <Link key={p.to} to={p.to}>{p.label}</Link>)}
          {brand.galleryUrl && (
            <a href={brand.galleryUrl} target="_blank" rel="noopener noreferrer">
              {brand.galleryLabel} <FiArrowUpRight aria-hidden="true" />
            </a>
          )}
        </nav>

        <div className={styles.reach}>
          {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
          {contact.location && <span>{contact.location}</span>}
          <SocialLinks socials={contact.socials} />
        </div>
      </div>

      <div className={`container ${styles.base}`}>
        <span>&copy; {new Date().getFullYear()} {brand.brandName}</span>
        <span className={styles.motto}>{brand.motto}</span>
      </div>
    </footer>
  );
};

export default Footer;
