import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const env = import.meta.env;

export const app = initializeApp({
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_APP_ID,
  measurementId: env.FIREBASE_MEASUREMENT_ID,
});

// App Check (reCAPTCHA Enterprise, part of Google Cloud Fraud Defense) stays off until a site key is set,
// and must start before Firestore, Storage or Auth. Classic reCAPTCHA v3 can no longer be registered.
export const appCheckOn = !!env.FIREBASE_APPCHECK_SITE_KEY;

if (appCheckOn) {
  // FIREBASE_APPCHECK_DEBUG_TOKEN (local dev only): empty or false = off, true = print a new debug
  // token in the browser console to register in App Check, anything else = that registered token.
  const debugToken = String(env.FIREBASE_APPCHECK_DEBUG_TOKEN ?? '').trim();
  if (env.DEV && debugToken && debugToken !== 'false') self.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken === 'true' ? true : debugToken;
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(env.FIREBASE_APPCHECK_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  });
}

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
