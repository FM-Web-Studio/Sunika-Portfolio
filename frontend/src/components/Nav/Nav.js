import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiMoon, FiSun, FiZap, FiZapOff } from 'react-icons/fi';
import { usePrefs } from '../../hooks/usePrefs';
import { useSite } from '../../context/SiteContext';
import CvButton from '../CvButton';
import { LOGOS } from '../../lib/logos';
import { createTapCounter } from '../../lib/secretTaps';
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
  const { copy } = useSite();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const linksRef = useRef(null);
  const pillRef = useRef(null);
  const progressRef = useRef(null);
  const navigate = useNavigate();
  // Five quick clicks on the logo open the admin. Not security: the admin still checks the account.
  const [secretTap] = useState(() => createTapCounter(5, 2000));
  const onBrandClick = (e) => {
    if (!secretTap()) return;
    e.preventDefault();
    navigate('/admin');
  };

  const placePill = useCallback((link) => {
    const pill = pillRef.current;
    if (!pill) return;
    if (!link) {
      pill.style.opacity = '0';
      return;
    }
    pill.style.opacity = '1';
    pill.style.width = `${link.offsetWidth}px`;
    pill.style.transform = `translateX(${link.offsetLeft}px)`;
    if (!pill.dataset.ready) requestAnimationFrame(() => { pill.dataset.ready = 'true'; });
  }, []);

  const placeOnActive = useCallback(() => {
    placePill(linksRef.current?.querySelector('[aria-current="page"]'));
  }, [placePill]);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    placeOnActive();
    const links = linksRef.current;
    if (!links) return undefined;
    const resize = new ResizeObserver(placeOnActive);
    resize.observe(links);
    document.fonts?.ready.then(placeOnActive);
    return () => resize.disconnect();
  }, [pathname, placeOnActive]);

  useEffect(() => {
    let queued = false;
    let room = 0;
    const measure = () => {
      queued = false;
      setScrolled(window.scrollY > 12);
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${room > 0 ? Math.min(1, window.scrollY / room) : 0})`;
    };
    const resize = new ResizeObserver(() => {
      room = document.documentElement.scrollHeight - window.innerHeight;
      measure();
    });
    resize.observe(document.body);
    const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(measure); } };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      resize.disconnect();
    };
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
        <Link to="/" className={styles.brand} aria-label={`${copy.brand.brandName}, home`} onClick={onBrandClick}>
          <img src={LOGOS.mark} alt="" />
          <span>{copy.brand.brandName}</span>
        </Link>

        <nav
          ref={linksRef}
          className={styles.links}
          aria-label="Main"
          onPointerOver={(e) => { const link = e.target.closest('a'); if (link) placePill(link); }}
          onPointerLeave={placeOnActive}
          onFocus={(e) => { const link = e.target.closest('a'); if (link) placePill(link); }}
          onBlur={placeOnActive}
        >
          <span ref={pillRef} className={styles.pill} aria-hidden="true" />
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
      <span ref={progressRef} className={styles.progress} aria-hidden="true" />

      {open && createPortal(
        <div className={styles.sheetBackdrop} onClick={() => setOpen(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Menu">
            <div className={styles.sheetHead}>
              <img src={LOGOS.wordmark} alt={copy.brand.brandName} className={styles.sheetLogo} />
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
