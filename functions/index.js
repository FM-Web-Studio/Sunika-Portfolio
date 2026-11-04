const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineString, defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const nodemailer = require('nodemailer');
const crypto = require('node:crypto');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

const REGION = 'europe-west1';

const SMTP_HOST = defineString('SMTP_HOST', { default: 'smtp.gmail.com' });
const SMTP_PORT = defineString('SMTP_PORT', { default: '465' });
const SMTP_USER = defineString('SMTP_USER');
const NOTIFY_TO = defineString('NOTIFY_TO', { default: 'lombardsunika@gmail.com' });
const SMTP_PASSWORD = defineSecret('SMTP_PASSWORD');

const SITES = {
  portfolioMessages: {
    label: 'Suni Designs',
    accent: '#DC3F55',
    intro: 'Someone reached out through your portfolio site.',
  },
  galleryMessages: {
    label: 'Sunika Gallery',
    accent: '#B8860B',
    intro: 'Someone reached out through your gallery site.',
  },
};

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

const makeHandler = (site) => async (event) => {
  const data = event.data && event.data.data();
  if (!data) {
    logger.warn('Trigger fired with no document data', { label: site.label, id: event.params.id });
    return;
  }

  const payload = {
    site,
    name: (data.name || '').trim() || 'Anonymous',
    email: (data.email || '').trim(),
    message: (data.message || '').trim() || '(empty message)',
    when: formatWhen(data.createdAt),
  };

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
      replyTo: payload.email || undefined,
      subject: `New ${site.label} message from ${payload.name}`,
      text: buildText(payload),
      html: buildHtml(payload),
    });
    logger.info('Notification sent', { label: site.label, id: event.params.id });
  } catch (err) {
    // SMTP error text can quote addresses, so only the codes are logged.
    logger.error('Failed to send notification', {
      label: site.label, id: event.params.id, code: err && err.code, responseCode: err && err.responseCode,
    });
  }
};

const opts = (document) => ({ document, region: REGION, secrets: [SMTP_PASSWORD], maxInstances: 5 });

exports.onPortfolioMessage = onDocumentCreated(opts('portfolioMessages/{id}'), makeHandler(SITES.portfolioMessages));
exports.onGalleryMessage = onDocumentCreated(opts('galleryMessages/{id}'), makeHandler(SITES.galleryMessages));

// Spam limits for the contact forms. A sender is one network address.
const LIMITS = {
  perSenderShort: { count: 2, ms: 10 * 60 * 1000 },
  perSenderDay: 5,
  perEmailDay: 5,
  everyoneDay: 40,
  minFillMs: 3000,
};
const DAY = 24 * 60 * 60 * 1000;
// Keep in step with MESSAGE_RETENTION_DAYS in frontend/src/content/legal.js and the privacy policy.
const KEEP_DAYS = 365;
const FIELD_MAX = { name: 200, email: 320, message: 5000 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Which inbox each site's form writes to.
const INBOXES = { portfolio: 'portfolioMessages', gallery: 'galleryMessages' };

// A one-way scramble, so no address or IP is ever stored as it is.
const scramble = (value) => crypto.createHash('sha256').update(`sunika:${value}`).digest('hex').slice(0, 40);

const clientIp = (req) => String(req?.headers?.['x-forwarded-for'] ?? req?.ip ?? 'unknown').split(',')[0].trim();

const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Deletes a few spent rate records each time, so the collection never grows.
const sweepLimits = async () => {
  const old = await db.collection('rateLimits').where('expireAt', '<', Timestamp.now()).limit(25).get();
  if (old.empty) return;
  const batch = db.batch();
  old.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
};

// The contact forms post here. It checks for bots and limits, then saves the message,
// which fires the matching email trigger above.
exports.sendMessage = onCall(
  {
    region: REGION,
    maxInstances: 5,
    cors: [/^https:\/\/sunika-studio(-gallery)?\.(web\.app|firebaseapp\.com)$/, /^https?:\/\/localhost(:\d+)?$/],
  },
  async (request) => {
    const d = request.data ?? {};
    const site = Object.hasOwn(INBOXES, d.site) ? d.site : null;
    const name = text(d.name, FIELD_MAX.name);
    const email = text(d.email, FIELD_MAX.email);
    const message = text(d.message, FIELD_MAX.message);

    // Bots fill the hidden field or post instantly. They get a quiet fake success.
    if (text(d.website, 200) || !(Number(d.elapsed) >= LIMITS.minFillMs)) {
      logger.info('Contact form: dropped a likely bot', { site });
      return { ok: true };
    }
    if (!site || !name || !message || !EMAIL.test(email)) {
      throw new HttpsError('invalid-argument', 'The name, email or message is missing or not valid.');
    }

    const now = Date.now();
    const sender = scramble(clientIp(request.rawRequest));
    const inbox = scramble(email.toLowerCase());
    const fingerprint = scramble(`${email.toLowerCase()}|${message.toLowerCase()}`);
    const day = new Date(now).toISOString().slice(0, 10);
    const refs = {
      sender: db.doc(`rateLimits/s-${sender}`),
      inbox: db.doc(`rateLimits/e-${inbox}`),
      repeat: db.doc(`rateLimits/m-${fingerprint}`),
      everyone: db.doc(`rateLimits/day-${site}-${day}`),
    };

    const verdict = await db.runTransaction(async (tx) => {
      const [s, e, m, all] = await Promise.all(Object.values(refs).map((r) => tx.get(r)));
      if (m.exists) return 'repeat';
      const sentBy = (s.get('times') ?? []).filter((t) => now - t < DAY);
      const recent = sentBy.filter((t) => now - t < LIMITS.perSenderShort.ms);
      const sentTo = (e.get('times') ?? []).filter((t) => now - t < DAY);
      if (recent.length >= LIMITS.perSenderShort.count || sentBy.length >= LIMITS.perSenderDay || sentTo.length >= LIMITS.perEmailDay) return 'sender';
      if ((all.get('count') ?? 0) >= LIMITS.everyoneDay) return 'everyone';

      const expireAt = Timestamp.fromMillis(now + DAY);
      tx.set(refs.sender, { times: [...sentBy, now], expireAt });
      tx.set(refs.inbox, { times: [...sentTo, now], expireAt });
      tx.set(refs.repeat, { expireAt });
      tx.set(refs.everyone, { count: FieldValue.increment(1), expireAt: Timestamp.fromMillis(now + 2 * DAY) }, { merge: true });
      tx.create(db.collection(INBOXES[site]).doc(), {
        name, email, message,
        createdAt: FieldValue.serverTimestamp(),
        expireAt: Timestamp.fromMillis(now + KEEP_DAYS * DAY),
      });
      return 'sent';
    });

    sweepLimits().catch((err) => logger.warn('Rate limit sweep failed', { error: err?.message }));

    // The same message twice is treated as sent, so a double click never shows an error.
    if (verdict === 'repeat') return { ok: true };
    if (verdict !== 'sent') {
      logger.info('Contact form: limit reached', { site, verdict });
      throw new HttpsError('resource-exhausted', verdict === 'everyone' ? 'everyone' : 'sender');
    }
    return { ok: true };
  },
);
