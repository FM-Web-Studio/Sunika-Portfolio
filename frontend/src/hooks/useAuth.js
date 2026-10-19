import { useEffect, useState } from 'react';
import { onAuthChange, isAdminEmail } from '../firebase/auth';

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
