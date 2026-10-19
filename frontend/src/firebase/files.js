import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './app';

const safeName = (name = 'image') => name.replace(/[^\w.-]+/g, '_').slice(-80);

export const uploadImage = async (folder, file) => {
  const path = `${folder}/${Date.now()}_${safeName(file.name)}`;
  const target = ref(storage, path);
  await uploadBytes(target, file, { contentType: file.type || 'image/jpeg' });
  return { path, url: await getDownloadURL(target), contentType: file.type || 'image/jpeg' };
};

export const removeImage = async (path) => {
  if (!path) return;
  try {
    await deleteObject(ref(storage, path));
  } catch {
    return;
  }
};
