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
}) {
  return (
    <div className={styles.card}>
      <div className={styles.headRow}>
        <h1 className={styles.title}>{title}</h1>
        <span className={`${styles.badge} ${styles[BADGE_TONE_CLASS[badgeTone]] ?? ''}`}>
          {badgeLabel}
        </span>
        {analyzedAt && <span className={styles.analyzedAt}>분석일시 {analyzedAt}</span>}
      </div>
      <p className={styles.address}>
        📍 {address} · {housingType}
      </p>
      <p className={styles.description}>{description}</p>
    </div>
  );
}
