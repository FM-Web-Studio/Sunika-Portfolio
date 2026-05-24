import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs,
  query, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db } from './app';
import { COLLECTIONS } from './config';

const COL = COLLECTIONS.education;

const mapDoc = (d) => ({ id: d.id, ...d.data() });

const sortByOrder = (list) =>
  [...list].sort((a, b) => (a.order ?? Number.POSITIVE_INFINITY) - (b.order ?? Number.POSITIVE_INFINITY));

const buildFields = (data) => ({
  institution:   data.institution   ?? '',
  qualification: data.qualification ?? '',
  field:         data.field         ?? '',
  period:        data.period        ?? '',
  start:         data.start         ?? '',
  end:           data.end ?? null,
  description:   data.description   ?? '',
  tags:          Array.isArray(data.tags) ? data.tags.map((t) => t.trim()).filter(Boolean) : [],
  order:         typeof data.order === 'number' ? data.order : Date.now(),
});

export const getEducation = async () => {
  const snap = await getDocs(query(collection(db, COL)));
  return sortByOrder(snap.docs.map(mapDoc));
};

export const subscribeEducation = (cb, onError) =>
  onSnapshot(query(collection(db, COL)), (snap) => cb(sortByOrder(snap.docs.map(mapDoc))), onError);

export const createEducation = (data) =>
  addDoc(collection(db, COL), { ...buildFields(data), createdAt: serverTimestamp() });

export const updateEducation = (id, data) =>
  updateDoc(doc(db, COL, id), { ...buildFields(data), updatedAt: serverTimestamp() });

export const deleteEducation = (id) => deleteDoc(doc(db, COL, id));
