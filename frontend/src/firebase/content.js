import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './app';

/*
 * Editable site copy + contact details live in ONE document in the shared
 * `settings` collection. The `portfolio_` doc-id prefix keeps it namespaced
 * from the gallery app that shares this Firebase project.
 *
 *   settings/portfolio_content -> { brand:{...}, home:{...}, ..., contact:{...} }
 *
 * NOTE: this requires a firestore.rules entry allowing public read and
 * admin-only write for settings/{docId}. See the project report.
 */
const CONTENT_DOC_ID = 'portfolio_content';
const contentRef = () => doc(db, 'settings', CONTENT_DOC_ID);

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
 * updateDoc sets the whole `group` field to the given object (replacing it), so a
 * cleared field is actually removed and falls back to its code default, while
 * sibling groups in the document are left untouched. Falls back to creating the
 * document if it does not exist yet.
 */
export async function saveContentGroup(group, overrides) {
  const ref = contentRef();
  try {
    await updateDoc(ref, { [group]: overrides });
  } catch {
    await setDoc(ref, { [group]: overrides }, { merge: true });
  }
}
