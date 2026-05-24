import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './app';
import { COLLECTIONS } from './config';

// Visitor messages from the portfolio contact form.
export const submitContactForm = async ({ name, email, message }) => {
  await addDoc(collection(db, COLLECTIONS.messages), {
    name,
    email,
    message,
    createdAt: serverTimestamp(),
  });
};
