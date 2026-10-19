import {
  collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from './app';
import { COLLECTIONS } from './config';

const inbox = () => collection(db, COLLECTIONS.messages);

export const sendMessage = ({ name, email, message }) =>
  addDoc(inbox(), { name, email, message, createdAt: serverTimestamp() });

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
