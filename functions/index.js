/**
 * Cloud Functions, contact-form email notifications.
 *
 * A new document in `messages` emails a formatted summary to the site
 * owner over a Gmail account's SMTP (nodemailer). Replying to the email goes
 * straight back to the visitor (their address is set as Reply-To).
 *
 * Setup (see functions/README.md):
 *   1. Project on the Blaze plan (required for outbound network / email).
 *   2. On the Gmail account, enable 2-Step Verification, then create an
 *      "App password" (Google Account, Security, App passwords). This is a
 *      setting on the existing Gmail, NOT a new account or signup.
 *   3. firebase functions:secrets:set SMTP_PASSWORD   (paste the 16-char app password)
 *   4. functions/.env holds SMTP_USER (and optionally NOTIFY_TO).
 *   5. firebase deploy --only functions
 */
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineString, defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const nodemailer = require('nodemailer');

// IMPORTANT: This region MUST match the Firestore database location for
// sunika-project. europe-west1 matches the reference projects. If the Sunika
// Firestore database lives elsewhere, change this value (check the console at
// Firestore, top of the Data page, or run
// `firebase firestore:databases:get`) or the triggers will fail to deploy.
const REGION = 'europe-west1';

const SMTP_HOST = defineString('SMTP_HOST', { default: 'smtp.gmail.com' });
const SMTP_PORT = defineString('SMTP_PORT', { default: '465' });
const SMTP_USER = defineString('SMTP_USER'); // the Gmail address that sends
const NOTIFY_TO = defineString('NOTIFY_TO', { default: 'lombardsunika@gmail.com' }); // where notifications land
const SMTP_PASSWORD = defineSecret('SMTP_PASSWORD'); // Gmail app password (secret)

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const formatWhen = (createdAt) => {
  const d = createdAt && typeof createdAt.toDate === 'function' ? createdAt.toDate() : new Date();
  try {
    return d.toLocaleString('en-ZA', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Africa/Johannesburg' });
  } catch {
    return d.toISOString();
  }
};

// Build a compact, email-client-friendly HTML message (table plus inline styles).
const buildHtml = ({ site, name, email, message, when }) => {
  const rows = [
    ['From', esc(name)],
    ['Email', email ? `<a href="mailto:${esc(email)}" style="color:${site.accent};font-weight:600;text-decoration:none;">${esc(email)}</a>` : '<span style="color:#94a3b8;">not provided</span>'],
    ['Received', esc(when)],
  ];

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">New ${esc(site.label)} message from ${esc(name)}.</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #e4e4e7;border-radius:14px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <tr><td style="background:${site.accent};padding:22px 28px;">
          <div style="color:#fff;font-size:18px;font-weight:700;">New ${esc(site.label)} message</div>
          <div style="color:rgba(255,255,255,0.85);font-size:13px;margin-top:2px;">${esc(site.intro)}</div>
        </td></tr>
        <tr><td style="padding:26px 28px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#3f3f46;">
            ${rows.map(([k, v]) => `<tr><td style="padding:6px 0;width:120px;color:#71717a;vertical-align:top;">${esc(k)}</td><td style="padding:6px 0;color:#18181b;">${v}</td></tr>`).join('')}
          </table>
        </td></tr>
        <tr><td style="padding:8px 28px 26px;">
          <div style="color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">Message</div>
          <div style="background:#fafafa;border:1px solid #ececed;border-left:3px solid ${site.accent};border-radius:8px;padding:16px 18px;color:#27272a;font-size:15px;line-height:1.7;">${esc(message).replace(/\r?\n/g, '<br>')}</div>
        </td></tr>
        <tr><td style="background:#fafafa;border-top:1px solid #ececed;padding:14px 28px;color:#a1a1aa;font-size:12px;">
          Just hit Reply to respond to ${esc(name)} directly. Automated notification from your website contact form.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
};

const buildText = ({ site, name, email, message, when }) =>
  `New ${site.label} message\n\n` +
  `From:     ${name}\n` +
  `Email:    ${email || 'not provided'}\n` +
  `Received: ${when}\n\n` +
  `Message:\n${message}\n`;

const SITE = {
  label: 'Sunika',
  accent: '#B83B63', // the site's raspberry rose accent
  intro: 'Someone reached out through your website.',
};

const handler = async (event) => {
  const data = event.data && event.data.data();
  if (!data) {
    logger.warn('Trigger fired with no document data', { id: event.params.id });
    return;
  }

  const name = (data.name || '').trim() || 'Anonymous';
  const email = (data.email || '').trim();
  const message = (data.message || '').trim() || '(empty message)';
  const when = formatWhen(data.createdAt);

  const payload = { site: SITE, name, email, message, when };

  const port = Number(SMTP_PORT.value()) || 465;
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST.value(),
    port,
    secure: port === 465,
    auth: { user: SMTP_USER.value(), pass: SMTP_PASSWORD.value() },
  });

  try {
    await transporter.sendMail({
      from: `"Sunika" <${SMTP_USER.value()}>`,
      to: NOTIFY_TO.value() || SMTP_USER.value(),
      replyTo: email || undefined,
      subject: `New ${SITE.label} message from ${name}`,
      text: buildText(payload),
      html: buildHtml(payload),
    });
    logger.info('Notification sent', { id: event.params.id, from: email });
  } catch (err) {
    // Do not rethrow. A retry storm will not fix bad credentials, and the
    // message is safely stored in Firestore regardless. Surface it in logs.
    logger.error('Failed to send notification', { id: event.params.id, error: err && err.message });
  }
};

exports.onContactMessage = onDocumentCreated(
  { document: 'messages/{id}', region: REGION, secrets: [SMTP_PASSWORD], maxInstances: 5 },
  handler,
);
