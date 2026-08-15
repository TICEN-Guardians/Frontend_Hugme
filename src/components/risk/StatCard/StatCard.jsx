import styles from './StatCard.module.css';

export default function StatCard({ icon, label, value, valueTone }) {
  return (
    <div className={styles.card}>
      <p className={styles.label}>
        {icon && <span className={styles.icon}>{icon}</span>}
        {label}
      </p>
      <p className={`${styles.value} ${valueTone === 'danger' ? styles.valueDanger : ''}`}>
        {value}
      </p>
    </div>
  );
}
