import StatCard from '../StatCard/StatCard.jsx';
import styles from './MetricSummary.module.css';

export default function MetricSummary({ metrics }) {
  return (
    <div className={styles.grid}>
      {metrics.map((metric) => (
        <StatCard
          key={metric.label}
          label={metric.label}
          value={metric.value}
          valueTone={metric.valueTone}
        />
      ))}
    </div>
  );
}
