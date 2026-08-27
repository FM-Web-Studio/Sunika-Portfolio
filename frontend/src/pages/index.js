import { lazy } from 'react';

/*
 * Lazy on purpose: static re-exports shipped the whole admin, its section files and
 * react-select in the first bundle to every anonymous visitor.
 *
 * Loading stays eager. It IS the Suspense fallback, so lazy-loading it would mean
 * suspending in order to render the thing shown while suspended.
 */
export { default as Loading } from './Loading';

export const Home     = lazy(() => import('./Home'));
export const Projects = lazy(() => import('./Projects'));
export const Contact  = lazy(() => import('./Contact'));
export const NotFound = lazy(() => import('./Not Found'));
export const Admin    = lazy(() => import('./Admin'));
