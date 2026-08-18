import styles from './ModelFactorList.module.css';

export default function ModelFactorList({ title, factors }) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>{title}</p>
      <div className={styles.list}>
        {factors.map((factor) => (
          <div key={factor.label} className={styles.row}>
            <span className={styles.icon}>{factor.icon}</span>
            <div className={styles.body}>
              <div className={styles.rowHead}>
                <span className={styles.label}>{factor.label}</span>
                <span className={styles.value}>{factor.score} / {factor.max}점</span>
              </div>
              <div className={styles.track}>
                <div className={styles.fill} style={{ width: `${(factor.score / factor.max) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
