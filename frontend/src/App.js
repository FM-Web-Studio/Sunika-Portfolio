import React, { Suspense, useCallback, useMemo, useTransition, useEffect } from 'react';
import { Routes, Route, useNavigate, Outlet, useLocation, Link } from 'react-router-dom';
import { NotFound, Loading, Home, Projects, Contact, Admin } from './pages';
import { NavigationBar, Settings, ToastProvider, Footer } from './components';
import { ContentProvider } from './context/ContentContext';
import { useTheme, useAnimations, useMomentumScroll, getLenis } from './hooks';
import styles from './App.module.css';

// Home is reached via the standalone logo (top-left), so it is not repeated here.
const NAVIGATION_PAGES = [
  { label: 'Projects', to: '/projects' },
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

  // Premium momentum scrolling on the public site only (never the admin route).
  useMomentumScroll();

  const handleNavigate = useCallback((to) => {
    if (to) startTransition(() => navigate(to));
  }, [navigate, startTransition]);

  const navigationLinks = useMemo(() => NAVIGATION_PAGES.map(p => ({ ...p })), []);

  return (
    <div className={styles.app}>
      <Link to="/" className={styles.brandLogo} aria-label="Home">
        <img src="/logo.png" alt="Sunika" className={styles.brandLogoImg} />
      </Link>

      <NavigationBar
        links={navigationLinks}
        onNavigate={handleNavigate}
        className={styles.navigationBar}
      />

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
