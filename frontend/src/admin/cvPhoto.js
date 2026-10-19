const SIZE = 420;

const loadImage = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That image could not be read.')); };
  img.src = url;
});

export const makeCvPhoto = async (file) => {
  const img = await loadImage(file);
  const side = Math.min(img.naturalWidth, img.naturalHeight) * 0.78;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, SIZE, SIZE);
  const x = (img.naturalWidth - side) / 2;
  const y = (img.naturalHeight - side) * 0.2;
  ctx.drawImage(img, x, y, side, side, 0, 0, SIZE, SIZE);
  return canvas.toDataURL('image/jpeg', 0.85);
};
