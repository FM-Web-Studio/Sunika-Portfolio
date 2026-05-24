import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdHome, MdArrowBack } from 'react-icons/md';
import { LightWaveButton } from '../../components';
import styles from './NotFound.module.css';

const SAYINGS = [
  { text: 'This page is in a superposition of existing and not existing. You just collapsed the wave function.',    attribution: "Schrödinger's Server"  },
  { text: 'Not all who wander are lost — but this URL definitely is.',                                              attribution: 'A GPS, Ironically'     },
  { text: 'The server checked everywhere. Under the tables, behind the CDN, even cleared the cache. Nothing.',     attribution: 'Sys Admin, 2 a.m.'     },
  { text: "Your destination exists in the git history. That's basically archaeology at this point.",                attribution: 'Senior Developer'      },
  { text: '404: the digital equivalent of opening the fridge, forgetting what you wanted, and closing it again.', attribution: 'Relatable Engineering' },
  { text: 'Your URL had excellent ambition. The destination, however, declined to participate.',                    attribution: 'Product Manager'       },
  { text: 'Life is a journey, not a destination. This URL interpreted that very literally.',                        attribution: 'Inspirational Poster'  },
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
      <main className={styles.card}>
        <div className={styles.statusBadge} aria-label="HTTP Error 404">
          <span className={styles.statusDot} aria-hidden="true" />
          <span>Error 404</span>
        </div>

        <div className={styles.codeDisplay} aria-hidden="true">404</div>

        <h1 className={styles.heading}>Page Not Found</h1>
        <p className={styles.subtext}>
          The page you&rsquo;re looking for has gone missing.
        </p>

        <div className={styles.divider} aria-hidden="true" />

        <div className={`${styles.sayingBlock} ${sayingVisible ? styles.sayingVisible : styles.sayingHidden}`}>
          <p className={styles.sayingText}>
            <span className={styles.quoteMark}>&ldquo;</span>
            {SAYINGS[currentSaying].text}
            <span className={styles.quoteMark}>&rdquo;</span>
          </p>
          <cite className={styles.sayingAttribution}>— {SAYINGS[currentSaying].attribution}</cite>
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
