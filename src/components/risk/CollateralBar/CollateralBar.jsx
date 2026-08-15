import { FaCircleInfo } from 'react-icons/fa6';
import styles from './CollateralBar.module.css';

export default function CollateralBar({ title, burdenRateLabel, segments, description }) {
  return (
    <div className={styles.card}>
      <div className={styles.headRow}>
        <p className={styles.title}>
          {title} <FaCircleInfo aria-hidden="true" />
        </p>
        <span className={styles.burdenBadge}>{burdenRateLabel}</span>
      </div>
      <div className={styles.bar}>
        {segments.map((segment) => (
          <div
            key={segment.label}
            className={`${styles.segment} ${styles[`segment${segment.tone}`]}`}
            style={{ width: `${segment.ratio}%` }}
          >
            {segment.amount} ({segment.ratio}%)
          </div>
        ))}
      </div>
      <div className={styles.legend}>
        {segments.map((segment) => (
          <span key={segment.label} className={styles.legendItem}>
            <span className={`${styles.legendSwatch} ${styles[`segment${segment.tone}`]}`} />
            {segment.label}
          </span>
        ))}
      </div>
      <p className={styles.description}>{description}</p>
    </div>
  );
}
