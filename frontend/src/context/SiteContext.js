import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { subscribeRecords } from '../firebase/records';
import { subscribeProfile, EMPTY_PERSONAL } from '../firebase/profile';
import { subscribeContact, EMPTY_CONTACT } from '../firebase/contact';
import { subscribeContent } from '../firebase/content';
import { resolveAll } from '../content/copy';

const SiteContext = createContext(null);

const SOURCES = [
  ['projects', (cb, err) => subscribeRecords('projects', cb, err), []],
  ['accomplishments', (cb, err) => subscribeRecords('accomplishments', cb, err), []],
  ['experience', (cb, err) => subscribeRecords('experience', cb, err), []],
  ['education', (cb, err) => subscribeRecords('education', cb, err), []],
  ['personal', (cb, err) => subscribeProfile('personal', cb, err), EMPTY_PERSONAL],
  ['skills', (cb, err) => subscribeProfile('skills', cb, err), { categories: [] }],
  ['interests', (cb, err) => subscribeProfile('interests', cb, err), { items: [] }],
  ['contact', subscribeContact, EMPTY_CONTACT],
  ['content', subscribeContent, {}],
];

const initial = Object.fromEntries(SOURCES.map(([key, , empty]) => [key, empty]));

export const SiteProvider = ({ children }) => {
  const [data, setData] = useState(initial);
  const [ready, setReady] = useState({});
  const [failed, setFailed] = useState({});

  useEffect(() => {
    const stops = SOURCES.map(([key, subscribe]) =>
      subscribe(
        (value) => {
          setData((d) => ({ ...d, [key]: value }));
          setReady((r) => (r[key] ? r : { ...r, [key]: true }));
          setFailed((f) => (f[key] ? { ...f, [key]: false } : f));
        },
        (error) => {
          console.error(`Could not load ${key}`, error);
          setReady((r) => ({ ...r, [key]: true }));
          setFailed((f) => ({ ...f, [key]: true }));
        },
      ));
    return () => stops.forEach((stop) => stop());
  }, []);

  const value = useMemo(() => ({
    ...data,
    copy: resolveAll(data.content),
    ready,
    failed,
    allReady: SOURCES.every(([key]) => ready[key]),
  }), [data, ready, failed]);

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
};

export const useSite = () => {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside SiteProvider');
  return ctx;
};
