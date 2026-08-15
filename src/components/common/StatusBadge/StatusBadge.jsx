import styles from './StatusBadge.module.css';

export default function StatusBadge({ label, tone = 'neutral' }) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{label}</span>;
}
