import { signInWithPopup, signInAnonymously, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from './app';
import { ADMIN_EMAILS } from './config';

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const signOutUser = () => signOut(auth);

export const onAuthChange = (cb) => onAuthStateChanged(auth, cb);

export const isAdminEmail = (email) =>
  !!email && ADMIN_EMAILS.includes(email.toLowerCase());

/**
 * The uid of the current visitor, signing them in anonymously if needed.
 *
 * Ratings, likes and review likes are all "one per visitor", and the only way
 * firestore.rules can hold that line is if each vote is a document keyed by an
 * identity the server issued. A localStorage flag cannot be enforced — clearing
 * it lets the same person vote again, and nothing stops a crafted client from
 * driving a counter anywhere it likes. An anonymous account is a real uid the
 * rules can key on, so one visitor genuinely gets one vote.
 *
 * It is not unbreakable: someone can sign out and get a fresh anonymous account.
 * It raises the cost from "clear one localStorage key" to "churn accounts", which
 * is the strongest guarantee available without making people register.
 *
 * REQUIRES: Anonymous sign-in enabled in the Firebase console
 * (Authentication → Sign-in method → Anonymous).
 *
 * An admin signed in with Google is already a real user, so this returns their
 * uid untouched rather than replacing their session.
 */
export const ensureVisitor = async () => {
  if (auth.currentUser) return auth.currentUser.uid;
  try {
    const { user } = await signInAnonymously(auth);
    return user.uid;
  } catch (err) {
    // If Anonymous sign-in is not switched on, EVERY visitor interaction that needs
    // an identity fails at once — ratings, likes, reviews, replies. Firebase reports
    // that as `auth/admin-restricted-operation`, which tells whoever is looking at
    // the console nothing about the actual cause. Say it plainly instead.
    if (err?.code === 'auth/admin-restricted-operation' || err?.code === 'auth/operation-not-allowed') {
      console.error(
        'Anonymous sign-in is disabled for this Firebase project, so ratings, likes and '
        + 'reviews cannot work. Enable it under Authentication → Sign-in method → Anonymous.',
      );
      const friendly = new Error('Sign-in for visitors is not enabled on this site yet.');
      friendly.code = 'visitor-auth-disabled';
      throw friendly;
    }
    throw err;
  }
};

/** The current uid if one exists, without triggering a sign-in. */
export const currentUid = () => auth.currentUser?.uid ?? null;
