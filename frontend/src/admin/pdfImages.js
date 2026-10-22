const PHOTO_SIZE = 420;

const loadImage = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That image could not be read.')); };
  img.src = url;
});

const sizeOf = (img) => ({
  width: img.naturalWidth || 800,
  height: img.naturalHeight || 400,
});

export const makeCvPhoto = async (file) => {
  const img = await loadImage(file);
  const { width, height } = sizeOf(img);
  const side = Math.min(width, height) * 0.78;
  const canvas = document.createElement('canvas');
  canvas.width = PHOTO_SIZE;
  canvas.height = PHOTO_SIZE;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, PHOTO_SIZE, PHOTO_SIZE);
  ctx.drawImage(img, (width - side) / 2, (height - side) * 0.2, side, side, 0, 0, PHOTO_SIZE, PHOTO_SIZE);
  return canvas.toDataURL('image/jpeg', 0.85);
};
