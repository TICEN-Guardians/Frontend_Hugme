import { FiAlertCircle, FiClock, FiHome, FiMapPin } from 'react-icons/fi';
import styles from './RiskSummaryCard.module.css';

const BADGE_TONE_CLASS = {
  warning: 'badgeWarning',
  danger: 'badgeDanger',
  success: 'badgeSuccess',
};

export default function RiskSummaryCard({
  title,
  badgeLabel,
  badgeTone,
  address,
  housingType,
  description,
  analyzedAt,
  action,
}) {
  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <div className={styles.heading}>
          <h1 className={styles.title}>{title}</h1>
          <span className={`${styles.badge} ${styles[BADGE_TONE_CLASS[badgeTone]] ?? ''}`}>
            <FiAlertCircle aria-hidden="true" />
            {badgeLabel}
          </span>
        </div>
        {action && <div className={styles.action}>{action}</div>}
      </div>
      <div className={styles.metaRow}>
        <p className={styles.address}>
          <FiMapPin aria-hidden="true" />
          <span>{address}</span>
        </p>
        <p className={styles.address}>
          <FiHome aria-hidden="true" />
          <span>{housingType}</span>
        </p>
        {analyzedAt && (
          <span className={styles.analyzedAt}>
            <FiClock aria-hidden="true" />
            분석일시 {analyzedAt}
          </span>
        )}
      </div>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}
