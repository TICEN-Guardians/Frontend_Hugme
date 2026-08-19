import { FaBuildingColumns, FaCircleCheck, FaCircleQuestion, FaGavel, FaScaleBalanced, FaTriangleExclamation } from 'react-icons/fa6';
import styles from './RegistrySafety.module.css';

const ICON = {
  mortgage: <FaBuildingColumns />,
  seizure: <FaGavel />,
  provisionalSeizure: <FaScaleBalanced />,
  jeonseRight: <FaScaleBalanced />,
};

const STATE_ICON = {
  safe: <FaCircleCheck />,
  caution: <FaTriangleExclamation />,
  risk: <FaTriangleExclamation />,
  unknown: <FaCircleQuestion />,
};

const STATE_LABEL = {
  safe: '안전',
  caution: '확인',
  risk: '위험',
  unknown: '미확인',
};

export default function RegistrySafety({ title, items, emptyMessage }) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>{title}</p>
      {items.length === 0 ? (
        <p className={styles.empty}>{emptyMessage}</p>
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <div key={item.key} className={styles.row}>
              <span className={styles.icon}>{ICON[item.key] ?? ICON.mortgage}</span>
              <span className={styles.label}>{item.label}</span>
              <span className={styles.detail}>{item.detail}</span>
              <span className={`${styles.badge} ${styles[item.state]}`}>
                {STATE_ICON[item.state]}
                {STATE_LABEL[item.state]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
