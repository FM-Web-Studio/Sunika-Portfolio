import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Botanical from '../components/Botanical';
import styles from './NotFound.module.css';

const NotFound = () => (
  <div className={`container ${styles.wrap}`}>
    <div className={styles.art} aria-hidden="true">
      <span className={styles.digit}>4</span>
      <img src="/logo-mark.png" alt="" className={styles.fox} width="512" height="444" />
      <span className={styles.digit}>4</span>
      <Botanical variant="sprig" className={styles.sprig} />
    </div>
    <h1 className={styles.title}>Page not found</h1>
    <p className="lede">The link may be old, or the page has moved.</p>
    <Link to="/" className="btn btn-primary"><FiArrowLeft aria-hidden="true" /> Back to the home page</Link>
  </div>
);

export default NotFound;
