import React, { Suspense, useCallback, useMemo, useState, useTransition, useEffect } from 'react';
import { Routes, Route, useNavigate, Outlet, useLocation, Link } from 'react-router-dom';
import { NotFound, Loading, Home, Projects, Gallery, Contact, Admin } from './pages';
import { NavigationBar, Settings, ToastProvider, Footer } from './components';
import { ContentProvider } from './context/ContentContext';
import { useTheme, useAnimations, useMomentumScroll, getLenis } from './hooks';
import styles from './App.module.css';

// Home is reached via the standalone logo (top-left), so it is not repeated here.
const NAVIGATION_PAGES = [
  { label: 'Projects', to: '/projects' },
  { label: 'Gallery',  to: '/gallery'  },
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

  // The top bar is transparent over the hero and picks up a frosted background
  // once the page has scrolled. Lenis drives native scroll, so a plain scroll
  // listener stays in sync with it.
  const [scrolled, setScrolled] = useState(() => window.scrollY > 8);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
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
    <Routes>
      <Route path="/admin" element={<Admin />} />
      <Route path="/" element={<AppLayout />}>
        <Route index             element={<Home />} />
        <Route path="projects"   element={<Projects />} />
        <Route path="gallery"    element={<Gallery />} />
        <Route path="contact"    element={<Contact />} />
        <Route path="loading"    element={<Loading />} />
        <Route path="*"          element={<NotFound />} />
      </Route>
    </Routes>
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
