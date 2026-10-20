import { useState } from 'react';
import { FiRotateCcw, FiUploadCloud } from 'react-icons/fi';
import { useSite } from '../context/SiteContext';
import { useToast } from '../components/Toast';
import { saveLogo, resetLogo } from '../firebase/branding';
import { makeCvLogo } from './pdfImages';
import ui from './Admin.module.css';

const LOGOS = [
  {
    kind: 'mark',
    title: 'Small logo',
    where: 'The menu bar, the browser tab, the loading screen and the badge on your photo. A square shape works best.',
  },
  {
    kind: 'wordmark',
    title: 'Full logo',
    where: 'The top of the home page, the footer, the phone menu and the CV. A wide shape works best.',
  },
];

const MAX_BYTES = 15 * 1024 * 1024;

const LogoCard = ({ kind, title, where }) => {
  const { logos, branding } = useSite();
  const { notify } = useToast();
  const [busy, setBusy] = useState(false);
  const custom = !!branding[`${kind}Url`];

  const upload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return notify('error', 'Please choose an image file, such as PNG or SVG.');
    if (file.size > MAX_BYTES) return notify('error', 'That file is over 15 MB. Please choose a smaller one.');
    setBusy(true);
    try {
      const cvCopy = kind === 'wordmark' ? await makeCvLogo(file) : '';
      await saveLogo(kind, file, branding, cvCopy);
      notify('success', kind === 'wordmark' && !cvCopy
        ? 'Logo saved. It is too detailed for the CV, so the CV keeps the original logo.'
        : 'Logo saved. The site is updated.');
    } catch (error) {
      console.error(error);
      notify('error', 'The logo did not upload. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!window.confirm(`Go back to the original ${title.toLowerCase()}?`)) return;
    setBusy(true);
    try {
      await resetLogo(kind, branding);
      notify('success', 'The original logo is back.');
    } catch {
      notify('error', 'That did not work. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={ui.card}>
      <header className={ui.cardHead}><h2>{title}</h2><span>{custom ? 'Uploaded' : 'Original'}</span></header>
      <div className={ui.cardBody}>
        <p className={ui.note}>{where}</p>
        <div className={`${ui.logoPreviews} ${kind === 'mark' ? ui.logoSquare : ''}`}>
          <figure className={ui.logoLight}><img src={logos[kind]} alt={`${title} on a light background`} /><figcaption>Light</figcaption></figure>
          <figure className={ui.logoDark}><img src={logos[kind]} alt={`${title} on a dark background`} /><figcaption>Dark</figcaption></figure>
        </div>
        <div className={ui.logoTools}>
          <label className={`btn btn-confirm ${busy ? ui.disabled : ''}`}>
            <FiUploadCloud aria-hidden="true" /> {busy ? 'Saving' : 'Upload a new logo'}
            <input type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg" className="sr-only" disabled={busy} onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
          </label>
          {custom && (
            <button type="button" className="btn btn-danger" onClick={reset} disabled={busy}>
              <FiRotateCcw aria-hidden="true" /> Use the original
            </button>
          )}
        </div>
        <small className={ui.note}>Use a PNG or SVG with a transparent background so it sits cleanly on both light and dark pages.</small>
      </div>
    </section>
  );
};

const LogosSection = () => (
  <div className={ui.stack}>
    {LOGOS.map((logo) => <LogoCard key={logo.kind} {...logo} />)}
  </div>
);

export default LogosSection;
