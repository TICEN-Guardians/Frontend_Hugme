import { FaCircleInfo } from 'react-icons/fa6';
import styles from './PriceComparisonChart.module.css';

export default function PriceComparisonChart({ title, bars, diffs }) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>
        {title} <FaCircleInfo aria-hidden="true" />
      </p>
      <div className={styles.content}>
        <div className={styles.chart}>
          {bars.map((bar) => (
            <div key={bar.label} className={styles.barColumn}>
              <span className={styles.barValue}>{bar.value}</span>
              <div className={styles.barTrack}>
                <div
                  className={`${styles.barFill} ${styles[`barTone${bar.tone}`]}`}
                  style={{ height: `${bar.heightRatio * 100}%` }}
                />
              </div>
              <span className={styles.barLabel}>{bar.label}</span>
            </div>
          ))}
        </div>
        <div className={styles.diffs}>
          {diffs.map((diff) => (
            <div key={diff.label}>
              <p className={styles.diffLabel}>{diff.label}</p>
              <p className={styles.diffValue}>{diff.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
