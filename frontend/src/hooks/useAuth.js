import { useState, useEffect } from 'react';
import { onAuthChange, isAdminEmail } from '../firebase';

// Tracks the signed-in Firebase user and whether they are an allowlisted admin.
// `loading` is true until the first auth state callback fires.
export const useAuth = () => {
  const [user, setUser] = useState(undefined);

  useEffect(() => onAuthChange(setUser), []);

  return {
    user: user || null,
    loading: user === undefined,
    isAdmin: !!user && isAdminEmail(user.email),
  };
};
