import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdHome, MdArrowBack } from 'react-icons/md';
import { LightWaveButton } from '../../components';
import styles from './NotFound.module.css';

const SAYINGS = [
  { text: 'This page must have wandered off to pick wildflowers.',                       attribution: 'Somewhere in the meadow' },
  { text: 'Oops, this little corner of the garden hasn’t bloomed yet.', attribution: 'The gardener' },
  { text: 'We looked everywhere, even behind the potted plants. No luck!',              attribution: 'A very thorough bee'     },
  { text: 'This link took a lovely wrong turn somewhere.',                              attribution: 'A daydreaming butterfly' },
  { text: 'Nothing growing here just yet, let’s head back to the sunshine.', attribution: 'Your friendly signpost' },
  { text: 'That page is off sketching clouds somewhere. Very on-brand of it.',          attribution: 'The sketchbook'          },
];

const NotFound = () => {
  const navigate = useNavigate();
  const [currentSaying, setCurrentSaying] = useState(0);
  const [sayingVisible, setSayingVisible]  = useState(true);

  const handleGoHome = () => navigate('/');
  const handleGoBack = () => window.history.length > 1 ? navigate(-1) : navigate('/');

  useEffect(() => {
    let swapTimeout;
    const interval = setInterval(() => {
      setSayingVisible(false);
      swapTimeout = setTimeout(() => {
        setCurrentSaying(prev => (prev + 1) % SAYINGS.length);
        setSayingVisible(true);
      }, 500);
    }, 9000);
    return () => { clearInterval(interval); clearTimeout(swapTimeout); };
  }, []);

  return (
    <div className={styles.root}>
      <span className={styles.blob} data-b="1" aria-hidden="true" />
      <span className={styles.blob} data-b="2" aria-hidden="true" />
      <span className={styles.blob} data-b="3" aria-hidden="true" />
      <main className={styles.card}>
        <div className={styles.statusBadge} aria-label="HTTP Error 404">
          <span className={styles.statusDot} aria-hidden="true" />
          <span>Lost your way?</span>
        </div>

        <div className={styles.codeDisplay} aria-hidden="true">404</div>

        <h1 className={styles.heading}>This page wandered off 🌿</h1>
        <p className={styles.subtext}>
          The link might be a little old, or this page has gone to bloom elsewhere.
          Let&rsquo;s get you back home.
        </p>

        <div className={styles.divider} aria-hidden="true" />

        <div className={`${styles.sayingBlock} ${sayingVisible ? styles.sayingVisible : styles.sayingHidden}`}>
          <p className={styles.sayingText}>
            <span className={styles.quoteMark}>&ldquo;</span>
            {SAYINGS[currentSaying].text}
            <span className={styles.quoteMark}>&rdquo;</span>
          </p>
          <cite className={styles.sayingAttribution}>{SAYINGS[currentSaying].attribution}</cite>
        </div>

        <div className={styles.divider} aria-hidden="true" />

        <div className={styles.actions}>
          <LightWaveButton onClick={handleGoHome}>
            <MdHome aria-hidden="true" />
            Go Home
          </LightWaveButton>
          <button type="button" onClick={handleGoBack} className={styles.backButton}>
            <MdArrowBack aria-hidden="true" />
            Go Back
          </button>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
