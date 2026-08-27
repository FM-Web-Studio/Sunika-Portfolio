import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from './app';
import { ADMIN_EMAILS } from './config';

/*
 * Admin sign-in only.
 *
 * There is no anonymous visitor identity on this site. The gallery site needs one,
 * its ratings and likes are one-per-visitor and the only way firestore.rules can
 * hold that line is a uid the server issued, so `ensureVisitor` lives there. This
 * site has nothing a visitor votes on, and keeping an unused sign-in path here
 * would mean anonymous accounts being minted for no reason.
 */
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const signOutUser = () => signOut(auth);

export const onAuthChange = (cb) => onAuthStateChanged(auth, cb);

export const isAdminEmail = (email) =>
  !!email && ADMIN_EMAILS.includes(email.toLowerCase());
