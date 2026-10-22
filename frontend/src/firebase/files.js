import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './app';
import { makeWebCopy } from '../lib/webImage';

const safeName = (name = 'image') => name.replace(/[^\w.-]+/g, '_').slice(-80);

export const uploadImage = async (folder, file) => {
  const path = `${folder}/${Date.now()}_${safeName(file.name)}`;
  const target = ref(storage, path);
  await uploadBytes(target, file, { contentType: file.type || 'image/jpeg' });
  return { path, url: await getDownloadURL(target) };
};

export const uploadWithWebCopy = async (folder, file) => {
  const original = await uploadImage(folder, file);
  const copy = await makeWebCopy(file).catch(() => null);
  if (!copy) return original;
  try {
    const web = await uploadImage(`${folder}/web`, copy);
    return { ...original, webPath: web.path, webUrl: web.url };
  } catch {
    return original;
  }
};

export const pathFromUrl = (url = '') => {
  const match = /[/]o[/]([^?]+)/.exec(url);
  return match ? decodeURIComponent(match[1]) : '';
};

export const removeImage = async (path) => {
  if (!path) return;
  try {
    await deleteObject(ref(storage, path));
  } catch {
    return;
  }
};
