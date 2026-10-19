import Botanical from './Botanical';
import styles from './PageHeader.module.css';

const PageHeader = ({ title, subtitle, motif = 'sprig' }) => (
  <header className={styles.header}>
    <Botanical variant={motif} className={styles.motif} />
    <div className={styles.text}>
      <h1 className={styles.title} data-reveal>{title}</h1>
      {subtitle && <p className="lede" data-reveal style={{ '--i': 1 }}>{subtitle}</p>}
    </div>
  </header>
);

export default PageHeader;
