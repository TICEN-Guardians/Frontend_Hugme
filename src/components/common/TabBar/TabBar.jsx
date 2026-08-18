import styles from './TabBar.module.css';

export default function TabBar({ tabs, activeKey, onChange, variant = 'line' }) {
  return (
    <div className={`${styles.tabBar} ${variant === 'pill' ? styles.pill : ''}`} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`${styles.tab} ${isActive ? styles.active : ''}`}
            onClick={() => onChange(tab.key)}
          >
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && <span className={styles.count}>{tab.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
