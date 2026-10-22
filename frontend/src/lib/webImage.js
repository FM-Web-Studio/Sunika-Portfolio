export const WEB_MAX = 1600;

export const scaledSize = (width, height, max = WEB_MAX) => {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
};

const loadImage = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That image could not be read.')); };
  img.src = url;
});

const toBlob = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));

export const makeWebCopy = async (file, max = WEB_MAX) => {
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return null;
  const img = await loadImage(file);
  const size = scaledSize(img.naturalWidth, img.naturalHeight, max);
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, size.width, size.height);
  let blob = await toBlob(canvas, 'image/webp', 0.82);
  if (!blob || blob.type !== 'image/webp') blob = await toBlob(canvas, 'image/jpeg', 0.85);
  if (!blob || blob.size >= file.size) return null;
  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
  return new File([blob], `${file.name.replace(/[.][^.]+$/, '') || 'image'}.${ext}`, { type: blob.type });
};

export const webSrc = (image) => image?.webUrl || image?.url || '';
