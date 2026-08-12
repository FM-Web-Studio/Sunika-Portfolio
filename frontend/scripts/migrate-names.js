/**
 * One-off migration: drop the `gallery_` / `portfolio_` prefixes.
 *
 *   gallery_artworks     -> artworks          gallery/artworks/…  -> artworks/…
 *   portfolio_projects   -> projects          portfolio/projects/… -> projects/…
 *   portfolio_education  -> education         portfolio/profile/…  -> profile/…
 *   portfolio_experience -> experience
 *   portfolio_profile    -> profile
 *   portfolio_messages   -> messages
 *   settings/portfolio_content -> settings/content
 *   settings/shared            -> settings/contact
 *
 * Runs in two passes so the site is never broken:
 *
 *   node scripts/migrate-names.js --copy      copy everything to the new names.
 *                                             The old names are left untouched,
 *                                             so the deployed site keeps working.
 *   ... deploy rules, then the frontend, then check the site ...
 *   node scripts/migrate-names.js --finalize  delete the old names.
 *
 * Without a flag it audits and prints the plan, changing nothing.
 *
 * The Storage half is the delicate part. A Firebase download URL embeds the
 * object path AND an access token held in the object's metadata, so moving an
 * object invalidates every URL already stored in Firestore. `file.copy()`
 * carries the metadata (and therefore the token) to the new path, so rewriting
 * the path inside the stored URL is enough to make it resolve again — no
 * re-upload, no new tokens, no re-issuing URLs.
 *
 * Needs a service-account key: $GOOGLE_APPLICATION_CREDENTIALS, or
 * <repo root>/serviceAccount.json, or the SERVICE_ACCOUNT value in frontend/.env.
 */
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const COPY = process.argv.includes('--copy');
const FINALIZE = process.argv.includes('--finalize');
const AUDIT = !COPY && !FINALIZE;

// ── Bootstrap ────────────────────────────────────────────────────────────────
const readServiceAccountFromEnv = () => {
  const envPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return null;
  const text = fs.readFileSync(envPath, 'utf8');
  const start = text.indexOf('SERVICE_ACCOUNT=');
  if (start === -1) return null;
  const open = text.indexOf('"', start);
  const close = text.lastIndexOf('"');
  if (open === -1 || close <= open) return null;
  try { return JSON.parse(text.slice(open + 1, close)); } catch { return null; }
};

const KEY_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS
  || path.resolve(__dirname, '../../serviceAccount.json');

const serviceAccount = fs.existsSync(KEY_PATH)
  ? JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'))
  : readServiceAccountFromEnv();

if (!serviceAccount) {
  console.error(`No service-account key found (looked at ${KEY_PATH} and frontend/.env).`);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${serviceAccount.project_id}.firebasestorage.app`,
});
const db = admin.firestore();
const bucket = admin.storage().bucket();

// ── The map ──────────────────────────────────────────────────────────────────
const COLLECTIONS = {
  gallery_artworks:     'artworks',
  portfolio_projects:   'projects',
  portfolio_education:  'education',
  portfolio_experience: 'experience',
  portfolio_profile:    'profile',
  portfolio_messages:   'messages',
};

const SETTINGS_DOCS = {
  portfolio_content: 'content',
  shared:            'contact',
};

// Longest prefix first: `portfolio/profile` and `portfolio/projects` both start
// with `portfolio/`, so order only matters if a shorter prefix is ever added.
const STORAGE_PREFIXES = [
  ['gallery/artworks/',   'artworks/'],
  ['portfolio/projects/', 'projects/'],
  ['portfolio/profile/',  'profile/'],
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const log  = (...a) => console.log(...a);
const head = (t) => log(`\n${'─'.repeat(72)}\n${t}\n${'─'.repeat(72)}`);
const act  = (msg) => log(`${AUDIT ? '  would  ' : '  DOING  '} ${msg}`);

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const BACKUP_DIR = path.resolve(__dirname, `backup-${stamp}`);
const backup = (name, data) => {
  if (AUDIT) return;
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  fs.writeFileSync(path.join(BACKUP_DIR, `${name}.json`), JSON.stringify(data, null, 2));
};

const listNames = async () => (await db.listCollections()).map((c) => c.id);

// Rewrite every storage reference inside a document. Two forms appear:
//   - a bare object path        "gallery/artworks/abc/123_x.jpg"
//   - a download URL, in which the path is percent-encoded ("%2F" for "/")
const rewriteRefs = (value) => {
  if (typeof value === 'string') {
    let out = value;
    for (const [from, to] of STORAGE_PREFIXES) {
      out = out.split(from).join(to);
      out = out.split(encodeURIComponent(from)).join(encodeURIComponent(to));
    }
    return out;
  }
  if (Array.isArray(value)) return value.map(rewriteRefs);
  if (value && typeof value === 'object' && value.constructor === Object) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, rewriteRefs(v)]));
  }
  // Timestamps, GeoPoints and other Firestore types pass through untouched.
  return value;
};

// ── 1. Copy Storage objects ──────────────────────────────────────────────────
// Done before Firestore so the rewritten URLs point at objects that exist.
const copyStorage = async () => {
  head('1. Storage objects');
  const [files] = await bucket.getFiles();
  const moves = [];
  for (const f of files) {
    if (f.name.endsWith('/')) continue;
    const hit = STORAGE_PREFIXES.find(([from]) => f.name.startsWith(from));
    if (hit) moves.push([f, hit[0], f.name.replace(hit[0], hit[1])]);
  }

  const alreadyNew = files.filter((f) => STORAGE_PREFIXES.some(([, to]) => f.name.startsWith(to))).length;
  log(`  ${files.length} object(s) in the bucket, ${moves.length} to copy, ${alreadyNew} already at a new path`);
  if (!moves.length) { log('  Nothing to copy.'); return 0; }

  act(`copy ${moves.length} object(s), preserving the download token on each`);
  if (AUDIT) {
    moves.slice(0, 3).forEach(([, , to]) => log(`      e.g. -> ${to}`));
    return moves.length;
  }

  let done = 0;
  for (const [file, , to] of moves) {
    const [exists] = await bucket.file(to).exists();
    if (!exists) await file.copy(bucket.file(to));
    if (++done % 25 === 0) log(`      ${done}/${moves.length}`);
  }
  log(`      ${done}/${moves.length} copied`);

  // The token has to survive, or every URL in Firestore 403s.
  const [srcMeta] = await moves[0][0].getMetadata();
  const [dstMeta] = await bucket.file(moves[0][2]).getMetadata();
  const srcTok = srcMeta.metadata?.firebaseStorageDownloadTokens;
  const dstTok = dstMeta.metadata?.firebaseStorageDownloadTokens;
  if (srcTok && srcTok !== dstTok) throw new Error('Download token was not preserved by copy(); aborting before Firestore is touched.');
  log(`  Download token preserved on the sampled object: ${srcTok ? 'yes' : 'n/a (no token set)'}`);
  return done;
};

// ── 2. Copy collections ──────────────────────────────────────────────────────
const copyCollections = async () => {
  head('2. Collections');
  const names = await listNames();

  for (const [from, to] of Object.entries(COLLECTIONS)) {
    if (!names.includes(from)) {
      const n = names.includes(to) ? (await db.collection(to).count().get()).data().count : 0;
      log(`  ${from.padEnd(22)} absent${names.includes(to) ? ` (already migrated: ${to} has ${n} doc(s))` : ''}`);
      continue;
    }
    const snap = await db.collection(from).get();
    log(`  ${from.padEnd(22)} -> ${to.padEnd(12)} ${snap.size} doc(s)`);
    backup(from, snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    act(`write ${snap.size} doc(s) into ${to}, ids preserved`);
    if (AUDIT) continue;

    // Batches cap at 500 writes; every collection here is far smaller, but
    // chunking keeps that from being a latent trap.
    for (let i = 0; i < snap.docs.length; i += 400) {
      const batch = db.batch();
      for (const d of snap.docs.slice(i, i + 400)) {
        batch.set(db.collection(to).doc(d.id), rewriteRefs(d.data()));
      }
      await batch.commit();
    }
  }
};

// ── 3. Rename the settings documents ─────────────────────────────────────────
const copySettings = async () => {
  head('3. settings documents');
  for (const [from, to] of Object.entries(SETTINGS_DOCS)) {
    const src = await db.doc(`settings/${from}`).get();
    if (!src.exists) {
      const dst = await db.doc(`settings/${to}`).get();
      log(`  settings/${from.padEnd(18)} absent${dst.exists ? ` (already migrated: settings/${to} exists)` : ''}`);
      continue;
    }
    log(`  settings/${from.padEnd(18)} -> settings/${to}`);
    backup(`settings_${from}`, src.data());
    act(`write settings/${to}`);
    if (!AUDIT) await db.doc(`settings/${to}`).set(rewriteRefs(src.data()));
  }
};

// ── 4. Data cleanup ──────────────────────────────────────────────────────────
// The socials list still advertises the retired standalone gallery site.
const DEAD_SOCIAL_URLS = ['sunika-gallery.web.app'];

const cleanContactDoc = async () => {
  head('4. Data cleanup');
  const ref = db.doc(`settings/${SETTINGS_DOCS.shared}`);
  const snap = await ref.get();
  if (!snap.exists) { log('  settings/contact not written yet, run --copy first.'); return; }

  const socials = snap.data().socials || [];
  const dead = socials.filter((s) => DEAD_SOCIAL_URLS.some((u) => String(s.url || '').includes(u)));
  if (!dead.length) { log('  No dead social links.'); return; }

  dead.forEach((s) => log(`  dead link: ${s.label} -> ${s.url}  (that site no longer exists)`));
  act(`remove ${dead.length} social link(s)`);
  if (!AUDIT) await ref.update({ socials: socials.filter((s) => !dead.includes(s)) });
};

// ── 5. Verify ────────────────────────────────────────────────────────────────
// Checked before anything is deleted: every doc present, and every storage
// reference in the new documents actually resolves to an object.
const verify = async () => {
  head('5. Verification');
  let ok = true;

  for (const [from, to] of Object.entries(COLLECTIONS)) {
    const names = await listNames();
    if (!names.includes(from)) continue;
    const [a, b] = await Promise.all([
      db.collection(from).count().get(),
      db.collection(to).count().get(),
    ]);
    const match = a.data().count === b.data().count;
    ok = ok && match;
    log(`  ${match ? 'ok  ' : 'FAIL'} ${from} (${a.data().count}) -> ${to} (${b.data().count})`);
  }

  const [files] = await bucket.getFiles();
  const present = new Set(files.map((f) => f.name));
  const referenced = new Set();
  const collect = (v) => {
    if (typeof v === 'string') {
      for (const m of v.matchAll(/firebasestorage\.googleapis\.com\/[^"'\s]*?\/o\/([^?"'\s]+)/g)) {
        try { referenced.add(decodeURIComponent(m[1])); } catch { /* skip */ }
      }
      if (/^(artworks|projects|profile)\/.+\.[a-z0-9]+$/i.test(v)) referenced.add(v);
    } else if (Array.isArray(v)) v.forEach(collect);
    else if (v && typeof v === 'object') Object.values(v).forEach(collect);
  };

  for (const name of [...Object.values(COLLECTIONS), 'settings']) {
    const snap = await db.collection(name).get();
    snap.docs.forEach((d) => collect(d.data()));
  }

  const missing = [...referenced].filter((p) => !present.has(p));
  const stillOld = [...referenced].filter((p) => /^(gallery|portfolio)\//.test(p));
  log(`  ${referenced.size} storage reference(s) in the new documents`);
  if (stillOld.length) { ok = false; log(`  FAIL ${stillOld.length} still point at an old path`); }
  if (missing.length) {
    ok = false;
    log(`  FAIL ${missing.length} reference(s) have no object:`);
    missing.slice(0, 10).forEach((p) => log(`         ${p}`));
  } else log('  ok   every reference resolves to an object');

  log(ok ? '\n  VERIFIED — safe to --finalize' : '\n  NOT VERIFIED — do not run --finalize');
  return ok;
};

// ── 6. Finalize ──────────────────────────────────────────────────────────────
const finalize = async () => {
  head('6. Deleting the old names');
  if (!(await verify())) throw new Error('Verification failed; nothing deleted.');

  const names = await listNames();
  for (const from of Object.keys(COLLECTIONS)) {
    if (!names.includes(from)) { log(`  ${from}: already gone`); continue; }
    const snap = await db.collection(from).get();
    act(`delete collection ${from} (${snap.size} docs)`);
    for (let i = 0; i < snap.docs.length; i += 400) {
      const batch = db.batch();
      snap.docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  }

  for (const from of Object.keys(SETTINGS_DOCS)) {
    const snap = await db.doc(`settings/${from}`).get();
    if (!snap.exists) { log(`  settings/${from}: already gone`); continue; }
    act(`delete settings/${from}`);
    await snap.ref.delete();
  }

  const [files] = await bucket.getFiles();
  const old = files.filter((f) => STORAGE_PREFIXES.some(([from]) => f.name.startsWith(from)));
  act(`delete ${old.length} object(s) under the old storage prefixes`);
  for (const f of old) await f.delete();
};

// ── Run ──────────────────────────────────────────────────────────────────────
(async () => {
  log(`\nSunika name migration — project ${serviceAccount.project_id}`);
  log(AUDIT     ? 'MODE: AUDIT. Nothing is written.'
    : COPY      ? 'MODE: COPY. New names are written; old names are left in place.'
    : /* FIN */   'MODE: FINALIZE. Old names are deleted after verification.');

  if (FINALIZE) {
    await finalize();
    head('Done');
    log('Old names removed. The site now runs entirely on the new names.');
    return;
  }

  await copyStorage();
  await copyCollections();
  await copySettings();
  if (!AUDIT) await cleanContactDoc();
  await verify();

  head('Done');
  if (AUDIT) log('Audit only. Re-run with --copy to perform the migration.');
  else {
    log(`Backups written to ${BACKUP_DIR}`);
    log('Next: deploy rules, deploy the frontend, check the site,');
    log('then run this script with --finalize to delete the old names.');
  }
})().catch((err) => {
  console.error('\nFAILED:', err.message || err);
  process.exit(1);
});
