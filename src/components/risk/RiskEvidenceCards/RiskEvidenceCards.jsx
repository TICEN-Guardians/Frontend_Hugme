import styles from './RiskEvidenceCards.module.css';

export default function RiskEvidenceCards({ title, reasons }) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>{title}</p>
      <div className={styles.list}>
        {reasons.map((reason) => (
          <div key={reason.label} className={styles.item}>
            <span className={styles.icon}>{reason.icon}</span>
            <div>
              <p className={styles.itemLabel}>{reason.label}</p>
              <p className={styles.itemDescription}>{reason.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
