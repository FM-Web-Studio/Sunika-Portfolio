import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './app';
import { COLLECTIONS } from './config';

// A visitor message from the contact form.
export const submitMessage = async ({ name, email, message }) => {
  await addDoc(collection(db, COLLECTIONS.messages), {
    name,
    email,
    message,
    createdAt: serverTimestamp(),
  });
};
