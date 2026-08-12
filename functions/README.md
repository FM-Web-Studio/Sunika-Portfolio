# Sunika Cloud Functions

One function, `onContactMessage`, watching `messages/{id}`.

When a visitor submits the contact form, a new Firestore document triggers a
formatted email to the site owner. Replying to that email replies to the visitor
(their address is set as `Reply-To`). Sending errors are logged and swallowed,
the message is always saved in Firestore regardless.

## One-time setup

Cloud Functions require the **Blaze** (pay-as-you-go) plan for outbound email.
It has a generous free tier, so a couple of contact forms cost effectively
nothing, but a card must be on file. Upgrade in the Firebase Console under
Usage and billing, Modify plan.

1. **Install deps**
   ```bash
   cd functions
   npm install
   ```

2. **Create the sending password.** With Gmail, turn on 2-Step Verification,
   then create an **App Password** (Google Account, Security, App passwords).
   It is a 16-character code. Store it as a secret:
   ```bash
   firebase functions:secrets:set SMTP_PASSWORD
   # paste the app password when prompted
   ```

3. **Set the sending address.** Edit `functions/.env` and set `SMTP_USER` to the
   Gmail address that will send the notifications. `NOTIFY_TO` defaults to
   `lombardsunika@gmail.com` (where notifications are delivered).

4. **Deploy**
   ```bash
   firebase deploy --only functions
   ```

## Region note

The triggers run in `europe-west1`, which MUST match the Firestore database
location for `sunika-project`. If the database lives in another region, change
`REGION` in `index.js`, otherwise the deploy will fail. Check the location in the
Firebase Console (Firestore, top of the Data page) or run
`firebase firestore:databases:get`.

## Notes

- Gmail sends `From` as the authenticated account. The visitor address is on
  `Reply-To`, so **Reply** goes straight to them.
- To change the recipient later, edit `NOTIFY_TO` in `.env` and redeploy.
- To rotate the password: `firebase functions:secrets:set SMTP_PASSWORD` then redeploy.
- View logs with `firebase functions:log`.
