import { lazy, Suspense, useEffect } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { usePrefs } from './hooks/usePrefs';
import { useSite } from './context/SiteContext';
import { useMomentumScroll, scrollToTarget } from './hooks/useMomentumScroll';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import Loading from './components/Loading';
import Nav from './components/Nav';
import styles from './App.module.css';

const Home = lazy(() => import('./pages/Home'));
const Projects = lazy(() => import('./pages/Projects'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Admin = lazy(() => import('./admin/Admin'));

const PublicLayout = () => {
  const { pathname } = useLocation();
  const { reduceMotion } = usePrefs();
  useMomentumScroll(!reduceMotion);

  useEffect(() => {
    scrollToTarget(0, { immediate: true });
  }, [pathname]);

  return (
    <div className={styles.app}>
      <a href="#main" className={styles.skip}>Skip to content</a>
      <Nav />
      <main id="main" className={styles.main}>
        <ErrorBoundary resetKey={pathname}>
          <Suspense fallback={<Loading verse={false} />}>
            <div key={pathname} className="page-enter">
              <Outlet />
            </div>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
};

const useFavicon = (href) => {
  useEffect(() => {
    const link = document.querySelector('link[rel="icon"]');
    if (link && href) link.href = href;
  }, [href]);
};

const App = () => {
  const { logos } = useSite();
  useFavicon(logos.mark);
  return (
    <Suspense fallback={<Loading full />}>
      <Routes>
        <Route path="/admin" element={<ErrorBoundary><Admin /></ErrorBoundary>} />
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="projects" element={<Projects />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
