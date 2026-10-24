// Keep in step with request.resource.size in storage.rules.
export const MAX_IMAGE_MB = 50;

export const tooLarge = (file) => !!file && file.size >= MAX_IMAGE_MB * 1024 * 1024;

export const tooLargeMessage = (file) =>
  `${file.name} is over ${MAX_IMAGE_MB} MB. Please export a smaller copy and add that instead.`;

const REFUSED = ['storage/unauthorized', 'storage/unauthenticated', 'permission-denied', 'unauthenticated'];

export const saveErrorMessage = (error) =>
  REFUSED.includes(error?.code)
    ? 'Firebase refused that save. Sign out, sign back in with your admin Google account, and try again.'
    : 'That did not save. Check your connection and try again.';
