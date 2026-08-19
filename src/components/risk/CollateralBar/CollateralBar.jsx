import { FiAlertTriangle, FiCheckCircle, FiDollarSign } from 'react-icons/fi';
import styles from './CollateralBar.module.css';

export default function CollateralBar({ title, burdenRateLabel, rows, track, description }) {
  return (
    <div className={styles.card}>
      <div className={styles.headRow}>
        <p className={styles.title}>
          <FiDollarSign aria-hidden="true" />
          {title}
        </p>
        <span className={styles.burdenBadge}>{burdenRateLabel}</span>
      </div>
      <div className={styles.recoveryChart}>
        <div className={styles.track}>
          <div className={styles.recoverable} style={{ width: `${track.recoverableRatio}%` }} />
          <div className={styles.deposit} style={{ width: `${track.depositRatio}%` }} />
          {track.excessRatio > 0 && (
            <div
              className={styles.excess}
              style={{ left: `${track.recoverableRatio}%`, width: `${track.excessRatio}%` }}
            />
          )}
        </div>
        <div className={styles.trackLabels}>
          <span>회수 가능 기준액</span>
          <span className={track.excessRatio > 0 ? styles.trackDanger : styles.trackSafe}>
            {track.statusLabel}
          </span>
        </div>
      </div>
      <div className={styles.rows}>
        {rows.map((row) => (
          <div key={row.label} className={styles.row}>
            <span className={styles.rowLabel}>{row.label}</span>
            <span className={`${styles.rowValue} ${row.tone === 'danger' ? styles.valueDanger : ''} ${row.tone === 'success' ? styles.valueSuccess : ''}`}>
              {row.tone === 'danger' && <FiAlertTriangle aria-hidden="true" />}
              {row.tone === 'success' && <FiCheckCircle aria-hidden="true" />}
              {row.value}
            </span>
          </div>
        ))}
      </div>
      <p className={styles.description}>{description}</p>
    </div>
  );
}
