import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './app';
import { SETTINGS_DOCS } from './config';

/*
 * Editable site copy, one document:
 *
 *   settings/portfolioContent -> { brand:{...}, home:{...}, projects:{...}, ... }
 *
 * The gallery has its own settings/galleryContent. Same shape, different groups.
 */
const contentRef = () => doc(db, 'settings', SETTINGS_DOCS.content);

/** The saved overrides object (only values that differ from code defaults). */
export async function getContent() {
  try {
    const snap = await getDoc(contentRef());
    return snap.exists() ? snap.data() : {};
  } catch (err) {
    console.error('Failed to load site content, using defaults:', err);
    return {};
  }
}

/**
 * Replace the overrides for a single group, e.g. saveContentGroup('home', {...}).
 * updateDoc replaces the whole `group` field, so a cleared field is removed and
 * falls back to its code default while sibling groups are left untouched.
 */
export async function saveContentGroup(group, overrides) {
  const ref = contentRef();
  try {
    await updateDoc(ref, { [group]: overrides });
  } catch {
    await setDoc(ref, { [group]: overrides }, { merge: true });
  }
}
