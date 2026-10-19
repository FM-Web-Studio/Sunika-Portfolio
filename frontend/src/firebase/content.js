import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './app';
import { COLLECTIONS, SETTINGS_DOCS } from './config';

const contentRef = () => doc(db, COLLECTIONS.settings, SETTINGS_DOCS.content);

export const subscribeContent = (cb, onError = () => {}) =>
  onSnapshot(contentRef(), (snap) => cb(snap.exists() ? snap.data() : {}), onError);

export const saveContent = (groups) => setDoc(contentRef(), groups);
