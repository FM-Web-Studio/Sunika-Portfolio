import { useState, useEffect } from 'react';
import { onAuthChange, isAdminEmail } from '../firebase';

// Tracks the signed-in Firebase user and whether they are an allowlisted admin.
// `loading` is true until the first auth state callback fires.
//
// Anonymous users are deliberately reported as signed OUT. The public pages sign
// visitors in anonymously so their ratings and likes can be enforced one-per-
// person (see firebase/auth.js). An anonymous session is an identity for voting,
// not a login — without this check, visiting the gallery first and then /admin
// would show "not authorised" instead of the Google sign-in button.
export const useAuth = () => {
  const [user, setUser] = useState(undefined);

  useEffect(() => onAuthChange(setUser), []);

  const account = user && !user.isAnonymous ? user : null;

  return {
    user: account,
    loading: user === undefined,
    isAdmin: !!account && isAdminEmail(account.email),
  };
};
