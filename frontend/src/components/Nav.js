import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiMoon, FiSun, FiZap, FiZapOff } from 'react-icons/fi';
import { usePrefs } from '../hooks/usePrefs';
import { useSite } from '../context/SiteContext';
import CvButton from './CvButton';
import styles from './Nav.module.css';

export const PAGES = [
  { to: '/', label: 'Home', end: true },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
];

const Toggles = () => {
  const { theme, toggleTheme, reduceMotion, toggleMotion } = usePrefs();
  return (
    <>
      <button type="button" className="icon-btn" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'} title="Theme">
        {theme === 'dark' ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
      </button>
      <button type="button" className="icon-btn" onClick={toggleMotion} aria-label={reduceMotion ? 'Turn animations on' : 'Turn animations off'} aria-pressed={!reduceMotion} title="Animations">
        {reduceMotion ? <FiZapOff aria-hidden="true" /> : <FiZap aria-hidden="true" />}
      </button>
    </>
  );
};

const Nav = () => {
  const { copy, logos } = useSite();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    let queued = false;
    const measure = () => { queued = false; setScrolled(window.scrollY > 12); };
    const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(measure); } };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={`${styles.bar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.brand} aria-label={`${copy.brand.brandName}, home`}>
          <img src={logos.mark} alt="" />
          <span>{copy.brand.brandName}</span>
        </Link>

        <nav className={styles.links} aria-label="Main">
          {PAGES.map((p) => (
            <NavLink key={p.to} to={p.to} end={p.end} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
              {p.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.tools}>
          <div className={styles.toggles}><Toggles /></div>
          <CvButton className={`btn btn-primary btn-sm ${styles.cv}`} />
          <button type="button" className={`icon-btn ${styles.burger}`} onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>
            <FiMenu aria-hidden="true" />
          </button>
        </div>
      </div>

      {open && createPortal(
        <div className={styles.sheetBackdrop} onClick={() => setOpen(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Menu">
            <div className={styles.sheetHead}>
              <img src={logos.wordmark} alt={copy.brand.brandName} className={styles.sheetLogo} />
              <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close menu">
                <FiX aria-hidden="true" />
              </button>
            </div>
            <nav className={styles.sheetLinks} aria-label="Mobile">
              {PAGES.map((p, i) => (
                <NavLink key={p.to} to={p.to} end={p.end} style={{ '--i': i }} className={({ isActive }) => `${styles.sheetLink} ${isActive ? styles.sheetActive : ''}`}>
                  {p.label}
                </NavLink>
              ))}
            </nav>
            <CvButton className="btn btn-primary" />
            <div className={styles.sheetToggles}><Toggles /></div>
          </div>
        </div>,
        document.body,
      )}
    </header>
  );
};

export default Nav;
