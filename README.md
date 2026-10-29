# Suni Designs

Sunika Lombard's design and illustration portfolio: a compact home page, a project
gallery with a lightbox, a contact form, and a one-click PDF CV. Everything on the
site, including every heading and button label, is edited from `/admin`.

Live at https://sunika-studio.web.app

The gallery of original artworks is a separate repo and deploy:
[`Sunika-Gallery`](https://github.com/FM-Web-Studio/Sunika-Gallery).

## Using the admin

Go to `/admin` and sign in with Google. Only the emails in the rules files and
`ADMIN_EMAILS` get in.

| Section | What it changes |
| --- | --- |
| Overview | Counts, a getting-started checklist, and a button to test the CV |
| Messages | Contact form messages. Open one to mark it read, reply or delete |
| Projects | Portfolio pieces. The first image is the cover, the first five show on the home page |
| Highlights | Wins and press. Star one to feature it on the home page and at the top of the CV |
| Profile | Photo, name, title and bio |
| Skills and interests | Skill groups and interest tags. Type one and press Enter |
| Experience, Education | The timeline on the home page and the CV |
| Contact details | Email, phone, location and social links, shared with the gallery site |
| Wording | Every heading, button and label on the site, with a reset per field |

Lists are reordered with the arrow buttons. Forms that save in one go show a bar at
the bottom that turns yellow when there are unsaved changes.

## The CV

The Download CV button in the menu builds a one-page A4 PDF in the browser from
the same data the site shows, in the brand colours. The PDF engine only downloads
when the visitor is idle or presses the button, so it never slows the page down.

The CV photo is not read from Storage, because Storage blocks the browser from
downloading its files for a PDF. Instead, saving a new photo under Admin, Profile
also saves a small square JPEG copy to `profile/cvPhoto`, which is only read when
someone downloads the CV. Any image format works, since the copy is always JPEG.
If the admin says the photo is not on the CV yet, choose the photo again and save.
The logos are fixed files, `frontend/public/brand-mark.png` (menu bar, tab icon) and
`frontend/public/brand-wordmark.png` (home page, footer, CV). To change a logo, replace
the file under a NEW name and update `src/lib/logos.js`: hosting caches images for a
year, so a file changed in place keeps showing the old version.

## Images

Every image uploaded in the admin is saved twice: the original, and a web copy
(WebP, at most 1600 px) in a `web/` folder beside it. Cards, highlights and the
viewer show the web copy; the viewer's Full size link opens the original. Replacing
or removing an image deletes both files, and a save that fails part way removes
whatever it had already uploaded, so Storage never holds files nothing points to.

## One Firebase project, two sites

| | Portfolio (this repo) | Gallery |
| --- | --- | --- |
| Hosting target | `portfolio` -> `sunika-studio` | `gallery` -> `sunika-studio-gallery` |
| Firestore | `projects`, `accomplishments`, `experience`, `education`, `profile` | `artworks` (+ `raters`/`likers`) |
| Contact inbox | `portfolioMessages` | `galleryMessages` |
| Editable copy | `settings/portfolioContent` | `settings/galleryContent` |
| Storage | `projects/`, `profile/`, `accomplishments/` | `artworks/` |

**Shared by both:** `settings/contact` (email, phone, location, social links).

`firestore.rules`, `storage.rules` and `functions/` are project wide, so this repo
owns them for both sites. The gallery repo deploys only `hosting:gallery`. A new
collection or Storage folder on the gallery side needs its rule added here, or the
default deny rejects it.

## Local development

```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
npm test         # vitest
npm run build    # -> frontend/build
```

`frontend/.env` holds the Firebase web config and `ADMIN_EMAILS`. It is gitignored
and mirrored as GitHub Actions secrets. The values end up in the client bundle and
are not secret; the rules do the real enforcement.

`FIREBASE_APPCHECK_SITE_KEY` (a reCAPTCHA v3 site key) turns on Firebase App Check.
Leave it unset and App Check stays off. For local work with enforcement on, also set
`FIREBASE_APPCHECK_DEBUG_TOKEN` to a debug token registered in the console.

```
frontend/src
  admin/      the admin: sections, record schemas, forms
  components/ shared UI: nav, footer, cards, lightbox, modal, toasts
  content/    copy.js, every visitor-facing string with its default; legal.js, privacy and terms
  context/    SiteContext, one live subscription per collection for the whole app
  cv/         the CV model (tested) and the PDF layout (lazy loaded)
  firebase/   data access, one module per concern
  hooks/      theme and motion preferences, reveal on scroll, momentum scroll
  lib/        small pure helpers, all unit tested
  pages/      Home, Projects, Contact, Legal (privacy and terms), NotFound
```

Animations respect the visitor's reduced motion setting, and the lightning
button in the nav turns them off for anyone who prefers a still page.

## Deploys

Every push to `main` runs the tests, builds, and deploys hosting plus the Firestore
and Storage rules.

Cloud Functions are opt in: Actions, Deploy to Firebase Hosting, Run workflow,
tick `deploy_functions`. The CI service account currently lacks the IAM roles to
deploy functions (it needs Service Account User on the App Engine default service
account, Cloud Functions Admin, Artifact Registry Writer and Secret Manager Admin),
so the practical route is a machine logged in as a project owner:

```bash
cd functions && npm install && cd ..
firebase deploy --only functions --project sunika-project
```

## Requirements on the Firebase project

- The Blaze plan, for the contact form email function.
- Anonymous sign-in enabled. This site does not use it, but the gallery's ratings
  and likes do, and the setting is project wide.
- Firestore TTL policies on `portfolioMessages.expireAt` and `galleryMessages.expireAt`.
  Contact messages carry an `expireAt` 12 months out, which the privacy policies promise.
