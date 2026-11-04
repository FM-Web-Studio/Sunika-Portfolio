// The longest name, email and message the form allows. The sendMessage function in
// functions/index.js applies the same caps, so keep the two in step.
export const MESSAGE_LIMITS = { name: 200, email: 320, message: 5000 };

// The fields sent to the sendMessage function, trimmed and capped.
export const messageFields = ({ name = '', email = '', message = '' }) => ({
  name: name.trim().slice(0, MESSAGE_LIMITS.name),
  email: email.trim().slice(0, MESSAGE_LIMITS.email),
  message: message.trim().slice(0, MESSAGE_LIMITS.message),
});
