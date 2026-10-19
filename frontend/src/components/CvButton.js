import { FiDownload, FiLoader } from 'react-icons/fi';
import { useCvDownload } from '../hooks/useCvDownload';
import { useSite } from '../context/SiteContext';
import styles from './CvButton.module.css';

const CvButton = ({ className = 'btn', compact = false }) => {
  const { copy } = useSite();
  const { download, busy, ready } = useCvDownload();
  const label = busy ? copy.cv.busy : copy.cv.button;

  return (
    <button
      type="button"
      className={`${className} ${styles.cv}`}
      onClick={download}
      disabled={busy || !ready}
      aria-busy={busy}
      aria-label={compact ? label : undefined}
      title={compact ? label : undefined}
    >
      {busy ? <FiLoader className={styles.spin} aria-hidden="true" /> : <FiDownload className={styles.icon} aria-hidden="true" />}
      {!compact && <span>{label}</span>}
    </button>
  );
};

export default CvButton;
