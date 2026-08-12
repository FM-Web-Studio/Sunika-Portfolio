import React, { Suspense, useCallback, useMemo, useState, useTransition, useEffect } from 'react';
import { Routes, Route, useNavigate, Outlet, useLocation, Link } from 'react-router-dom';
import { NotFound, Loading, Home, Projects, Gallery, Reviews, Contact, Admin } from './pages';
import { NavigationBar, Settings, ToastProvider, Footer } from './components';
import { ContentProvider } from './context/ContentContext';
import { useTheme, useAnimations, useMomentumScroll, getLenis } from './hooks';
import styles from './App.module.css';

// Home is reached via the standalone logo (top-left), so it is not repeated here.
const NAVIGATION_PAGES = [
  { label: 'Projects', to: '/projects' },
  { label: 'Gallery',  to: '/gallery'  },
  { label: 'Reviews',  to: '/reviews'  },
  { label: 'Contact',  to: '/contact'  },
];

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppLayout = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [, startTransition] = useTransition();

  // Momentum scrolling on the public site only (never the admin route).
  useMomentumScroll();

  /*
   * The top bar is transparent over the hero and picks up a frosted background once
   * the page has scrolled.
   *
   * The threshold is read inside a rAF-throttled handler rather than straight from
   * the scroll event. Lenis emits scroll continuously while it interpolates, so the
   * raw handler fires many times per frame; reading `window.scrollY` in each one is
   * a forced layout read in the middle of Lenis's own frame work. Coalescing to one
   * read per frame removes that. setScrolled with an unchanged boolean is a no-op in
   * React, so this only ever re-renders on the two real transitions.
   */
  const [scrolled, setScrolled] = useState(() => window.scrollY > 8);

  useEffect(() => {
    let queued = false;
    const measure = () => { queued = false; setScrolled(window.scrollY > 8); };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavigate = useCallback((to) => {
    if (to) startTransition(() => navigate(to));
  }, [navigate, startTransition]);

  const navigationLinks = useMemo(() => NAVIGATION_PAGES.map(p => ({ ...p })), []);

  return (
    <div className={styles.app}>
      <header className={`${styles.topBar} ${scrolled ? styles.topBarScrolled : ''}`}>
        <Link to="/" className={styles.brandLogo} aria-label="Home">
          <img src="/logo-mark.png" alt="Suni Designs" className={styles.brandLogoImg} />
        </Link>

        <NavigationBar links={navigationLinks} onNavigate={handleNavigate} />
      </header>

      <div className={styles.themeSwitch}>
        <Settings theme={theme} toggleTheme={toggleTheme} />
      </div>

      <div key={location.pathname} className={styles.pageContent}>
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </div>

      <Footer />
    </div>
  );
};

const AppContent = () => (
  <>
    <ScrollToTop />
    {/* Admin sits outside AppLayout, so it needs its own boundary — the layout's
        Suspense only covers the public Outlet. Every route is lazy now (see
        pages/index.js), and a lazy element without a boundary above it throws. */}
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/" element={<AppLayout />}>
          <Route index             element={<Home />} />
          <Route path="projects"   element={<Projects />} />
          <Route path="gallery"    element={<Gallery />} />
          <Route path="reviews"    element={<Reviews />} />
          <Route path="contact"    element={<Contact />} />
          <Route path="loading"    element={<Loading />} />
          <Route path="*"          element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  </>
);

const App = () => {
  useTheme();
  useAnimations();
  return (
    <ToastProvider>
      <ContentProvider>
        <AppContent />
      </ContentProvider>
    </ToastProvider>
  );
};

export default App;
