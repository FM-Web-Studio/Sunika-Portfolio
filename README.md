# Sunika Portfolio

The portfolio site: projects, an about section with accomplishments, skills and
interests, a journey timeline, and a contact form, all managed from `/admin`
rather than in code.

Live at https://sunika-studio.web.app

The gallery of original artworks is a separate repo and a separate deploy:
[`Sunika-Gallery`](https://github.com/FM-Web-Studio/Sunika-Gallery).

## One Firebase project, two sites

Both sites live in the Firebase project `sunika-project`, sharing the Firestore
database, the Storage bucket and the admin allowlist.

| | Portfolio (this repo) | Gallery |
| --- | --- | --- |
| Hosting target | `portfolio` -> `sunika-studio` | `gallery` -> `sunika-studio-gallery` |
| Firebase web app | `...web:53e9bbc0cdc7941b4944cf` | `...web:a057f926f8e030ea4944cf` |
| Firestore | `projects`, `education`, `experience`, `profile`, `accomplishments` | `artworks` (+ `raters`/`likers`) |
| Contact inbox | `portfolioMessages` | `galleryMessages` |
| Editable copy | `settings/portfolioContent` | `settings/galleryContent` |
| Storage | `projects/`, `profile/`, `accomplishments/` | `artworks/` |

**Shared by both:** `settings/contact`, the email, phone, location and social
links. There is one of Sunika, so there is one set of those, and editing them in
either admin changes both sites. Everything else has exactly one owner, so neither
site can overwrite the other's content.

The prefix is the convention: a `portfolio` or `gallery` prefix means one site owns
it, no prefix means it is shared. Names are declared in one place,
`frontend/src/firebase/config.js`.

The two sites' images are not shared even though the bucket is: no code in either
repo reads the other's folder. The Storage paths deliberately did not change when
the sites were split, because a Firebase download URL embeds both the object path
and an access token from the object's metadata, so renaming a folder invalidates
every URL already stored in Firestore. There was nothing to gain from paying that
price for folders that already had one owner.

### This repo owns the project-wide config

`firestore.rules`, `storage.rules` and `functions/` are project-wide, not
per-site, so they have a single owner: **this repo**. The gallery repo declares
only `hosting` in its `firebase.json` and deploys only `hosting:gallery`.

Two repos deploying the same rules file would race, and the last push would win,
silently reverting the other site's rules.

**A new collection or Storage folder on the gallery side needs its rule added
here and deployed from here.** Until it is, the default-deny rule rejects it.

## Local development

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm test         # vitest
npm run build    # -> frontend/build
```

`frontend/.env` holds the Firebase web config and the admin allowlist. It is
gitignored; the same values are set as GitHub Actions secrets for the deploy.
They are baked into the client bundle and are not secrets, the real enforcement
is in the rules.

## Deploys

`main` deploys hosting, Firestore rules and Storage rules automatically.

Cloud Functions are **opt-in**, not on every push: they need broader IAM than
hosting and access to the `SMTP_PASSWORD` secret, so wiring them into every push
would turn `main` red on a permissions problem unrelated to the site. To ship a
functions change: Actions -> Deploy to Firebase Hosting -> Run workflow -> tick
**deploy_functions**. See `functions/README.md`.

## Requirements on the Firebase project

- The Blaze plan, for the contact-form email function.
- **Anonymous sign-in must be enabled** (Authentication -> Sign-in method ->
  Anonymous). This site does not use it, but the gallery's ratings and likes do,
  and the setting is project-wide.

## Layout

```
frontend/src
  pages/Home        hero, about, work, journey, contact, in one scroll
  pages/Projects    the full project grid
  pages/Contact     the form + contact details
  pages/Admin       projects, profile, accomplishments, skills, experience,
                    education, interests, socials, contact details, site copy
  firebase          one module per collection, over src/firebase/config.js
  content/siteCopy  every visitor-facing string, with its in-code default
```

Visitor-facing copy is not hardcoded in the pages: `content/siteCopy.js` declares
each string with a `default`, and only admin edits that differ from the default
are stored in Firestore. A test fails the build if a copy field exists that no
page renders.

The link across to the gallery site is one of those copy fields (Site Copy ->
Brand & Footer -> *Gallery site: URL*) rather than a constant, so moving that site
does not need a code change here. Left blank, the link does not render.
