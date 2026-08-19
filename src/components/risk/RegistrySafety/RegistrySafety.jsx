import {
  FiAlertOctagon,
  FiAlertTriangle,
  FiBookmark,
  FiCheckCircle,
  FiFile,
  FiFileText,
  FiHelpCircle,
  FiHome,
  FiLock,
  FiSlash,
} from 'react-icons/fi';
import styles from './RegistrySafety.module.css';

const ICON = {
  mortgage: <FiHome />,
  seizure: <FiSlash />,
  provisionalSeizure: <FiAlertOctagon />,
  provisionalDisposition: <FiFileText />,
  auctionCommenced: <FiAlertTriangle />,
  trustRegistration: <FiLock />,
  jeonseRight: <FiBookmark />,
  leaseholdRegistration: <FiFile />,
};

const STATE_ICON = {
  safe: <FiCheckCircle />,
  caution: <FiAlertOctagon />,
  risk: <FiAlertTriangle />,
  unknown: <FiHelpCircle />,
};

const STATE_LABEL = {
  safe: '안전',
  caution: '확인',
  risk: '위험',
  unknown: '미확인',
};

export default function RegistrySafety({ title, items, emptyMessage }) {
  const summary = items.reduce(
    (acc, item) => {
      acc[item.state] = (acc[item.state] ?? 0) + 1;
      return acc;
    },
    { safe: 0, caution: 0, risk: 0, unknown: 0 },
  );

  return (
    <div className={styles.card}>
      <p className={styles.title}>{title}</p>
      {items.length === 0 ? (
        <p className={styles.empty}>{emptyMessage}</p>
      ) : (
        <>
          <p className={styles.summary}>
            {items.length}개 항목 중 안전 {summary.safe} · 위험 {summary.risk} · 미확인 {summary.unknown}
          </p>
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
        </>
      )}
    </div>
  );
}
