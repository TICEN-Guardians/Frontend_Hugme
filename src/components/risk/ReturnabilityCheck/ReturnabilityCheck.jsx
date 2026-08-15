import styles from './ReturnabilityCheck.module.css';

export default function ReturnabilityCheck({ title, items }) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>{title}</p>
      <div className={styles.list}>
        {items.map((item) => (
          <div key={item.label} className={styles.row}>
            <span className={styles.label}>{item.label}</span>
            <span className={`${styles.badge} ${styles[`badge${item.tone}`]}`}>{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
