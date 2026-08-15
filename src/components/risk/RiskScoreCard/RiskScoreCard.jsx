import styles from './RiskScoreCard.module.css';

export default function RiskScoreCard({ score, maxScore, subScores }) {
  const percent = Math.round((score / maxScore) * 100);

  return (
    <div className={styles.card}>
      <p className={styles.label}>종합 위험 점수 ⓘ</p>
      <p className={styles.scoreRow}>
        <span className={styles.score}>{score}</span>
        <span className={styles.maxScore}>/ {maxScore}</span>
      </p>
      <div className={styles.gauge}>
        <span className={styles.gaugeMarker} style={{ left: `${percent}%` }} />
      </div>
      <div className={styles.scale}>
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
      <div className={styles.subScores}>
        {subScores.map((item) => (
          <div key={item.label} className={styles.subScoreRow}>
            <span className={styles.subScoreLabel}>{item.label}</span>
            <div className={styles.subScoreBarTrack}>
              <div
                className={styles.subScoreBarFill}
                style={{ width: `${(item.score / item.max) * 100}%` }}
              />
            </div>
            <span className={styles.subScoreValue}>
              {item.score}/{item.max}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
