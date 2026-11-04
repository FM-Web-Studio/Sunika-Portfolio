import { deleteDoc, doc, collection, onSnapshot, updateDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app, db } from './app';
import { COLLECTIONS } from './config';
import { messageFields } from '../lib/message';

const inbox = () => collection(db, COLLECTIONS.messages);

// Sends a message through the server, which checks for spam and limits how often one person can write.
// website is the hidden trap field, elapsed is how long the form was open in milliseconds.
// Throws an Error whose message is 'limit' (with .limit 'sender' or 'everyone') or 'failed'.
export const sendMessage = async ({ website = '', elapsed = 0, ...form }) => {
  const send = httpsCallable(getFunctions(app, 'europe-west1'), 'sendMessage');
  try {
    await send({ site: 'portfolio', ...messageFields(form), website, elapsed });
  } catch (err) {
    const tooMany = err?.code === 'functions/resource-exhausted';
    const error = new Error(tooMany ? 'limit' : 'failed');
    error.limit = tooMany ? (err.message === 'everyone' ? 'everyone' : 'sender') : null;
    throw error;
  }
};

export const subscribeMessages = (cb, onError = () => {}) =>
  onSnapshot(
    inbox(),
    (snap) => cb(
      snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)),
    ),
    onError,
  );

export const markMessageRead = (id, read = true) => updateDoc(doc(inbox(), id), { read });
export const deleteMessage = (id) => deleteDoc(doc(inbox(), id));
