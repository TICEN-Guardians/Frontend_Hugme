import styles from './ModelFactorList.module.css';

export default function ModelFactorList({ title, factors }) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>{title} ⓘ</p>
      <div className={styles.list}>
        {factors.map((factor, index) => (
          <div key={factor.label} className={styles.row}>
            <span className={styles.index}>{index + 1}</span>
            <span className={styles.label}>{factor.label}</span>
            <div className={styles.track}>
              <div className={styles.fill} style={{ width: `${factor.percent}%` }} />
            </div>
            <span className={styles.value}>{factor.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
