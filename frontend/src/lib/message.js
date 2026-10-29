import { MESSAGE_RETENTION_DAYS } from '../content/legal';

export const MESSAGE_LIMITS = { name: 200, email: 320, message: 5000 };

// The fields firestore.rules accepts for a contact message, apart from the server timestamp.
// expireAt drives the Firestore TTL policy that deletes the message.
export const messageFields = ({ name = '', email = '', message = '' }, now = Date.now()) => ({
  name: name.trim().slice(0, MESSAGE_LIMITS.name),
  email: email.trim().slice(0, MESSAGE_LIMITS.email),
  message: message.trim().slice(0, MESSAGE_LIMITS.message),
  expireAt: new Date(now + MESSAGE_RETENTION_DAYS * 864e5),
});
