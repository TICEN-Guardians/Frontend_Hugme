import styles from './MetricSummary.module.css';

export default function MetricSummary({ metrics }) {
  return (
    <div className={styles.surface}>
      <p className={styles.title}>계약 위험 지표</p>
      <div className={styles.grid}>
      {metrics.map((metric) => (
        <div key={metric.label} className={styles.metric}>
          <p className={styles.label}>{metric.label}</p>
          {metric.icon && <span className={styles.icon}>{metric.icon}</span>}
          <p className={`${styles.value} ${metric.valueTone === 'danger' ? styles.valueDanger : ''} ${metric.valueTone === 'success' ? styles.valueSuccess : ''}`}>
            {metric.value}
          </p>
          {metric.description && <p className={styles.description}>{metric.description}</p>}
        </div>
      ))}
      </div>
    </div>
  );
}
