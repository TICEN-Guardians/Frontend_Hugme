import { FiAlertCircle, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import styles from './ReturnabilityCheck.module.css';

const STATUS_ICON = {
  Success: FiCheckCircle,
  Warning: FiAlertTriangle,
  Danger: FiAlertCircle,
};

function StatusIcon({ tone }) {
  const Icon = STATUS_ICON[tone];
  return Icon ? <Icon aria-hidden="true" /> : null;
}

export default function ReturnabilityCheck({ title, items }) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>{title}</p>
      <div className={styles.list}>
        {items.map((item) => (
          <div key={item.key ?? item.label} className={styles.row}>
            <span className={styles.label}>{item.label}</span>
            <span className={`${styles.badge} ${styles[`badge${item.tone}`]}`}>
              <StatusIcon tone={item.tone} />
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
