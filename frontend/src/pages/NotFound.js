import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Botanical from '../components/Botanical';
import { useSite } from '../context/SiteContext';
import styles from './NotFound.module.css';

const NotFound = () => {
  const { logos } = useSite();
  return (
    <div className={`container ${styles.wrap}`}>
      <div className={styles.art} aria-hidden="true">
        <span className={styles.digit}>4</span>
        <img src={logos.mark} alt="" className={styles.fox} />
        <span className={styles.digit}>4</span>
        <Botanical variant="sprig" className={styles.sprig} />
      </div>
      <h1 className={styles.title}>Page not found</h1>
      <p className="lede">The link may be old, or the page has moved.</p>
      <Link to="/" className="btn btn-primary"><FiArrowLeft aria-hidden="true" /> Back to the home page</Link>
    </div>
  );
};

export default NotFound;
