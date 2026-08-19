import { FiShield } from 'react-icons/fi';
import styles from './RiskScoreCard.module.css';

const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const TONE_CLASS = {
  success: 'toneSuccess',
  warning: 'toneWarning',
  danger: 'toneDanger',
};

export default function RiskScoreCard({ score, maxScore, tone, gradeLabel, note }) {
  const percent = Math.max(0, Math.min(100, Math.round((score / maxScore) * 100)));
  const offset = CIRCUMFERENCE * (1 - percent / 100);
  const toneClass = styles[TONE_CLASS[tone]] ?? '';

  return (
    <div className={styles.card}>
      <p className={styles.label}>
        <FiShield aria-hidden="true" />
        종합 위험도
      </p>
      <div className={styles.gaugeWrap}>
        <svg className={styles.gauge} viewBox="0 0 200 200">
          <circle className={styles.track} cx="100" cy="100" r={RADIUS} />
          <circle
            className={`${styles.progress} ${toneClass}`}
            cx="100"
            cy="100"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <div className={styles.gaugeCenter}>
          <span className={styles.score}>{score}</span>
          <span className={styles.maxScore}>/ {maxScore}</span>
        </div>
      </div>
      <span className={`${styles.badge} ${toneClass}`}>{gradeLabel}</span>
      {note && <p className={styles.note}>{note}</p>}
    </div>
  );
}
