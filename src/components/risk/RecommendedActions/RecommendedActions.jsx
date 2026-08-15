import styles from './RecommendedActions.module.css';

export default function RecommendedActions({ title, actions }) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>{title} ⓘ</p>
      <div className={styles.list}>
        {actions.map((action) => (
          // TODO: 클릭 시 이동/상세 동작이 Design에 정의돼 있지 않음. 지금은 시각적으로만 클릭 가능하게 처리.
          <button key={action.title} type="button" className={styles.row} onClick={() => {}}>
            <span className={styles.icon}>{action.icon}</span>
            <div className={styles.content}>
              <p className={styles.actionTitle}>{action.title}</p>
              <p className={styles.actionDescription}>{action.description}</p>
            </div>
            <span className={styles.chevron} aria-hidden="true">
              ›
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
