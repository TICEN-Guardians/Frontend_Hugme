import { FiTrendingDown } from 'react-icons/fi';
import styles from './PriceScenarioTable.module.css';

export default function PriceScenarioTable({ title, rows, note }) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>
        <FiTrendingDown aria-hidden="true" />
        {title}
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.headCell}>시나리오</th>
              <th className={styles.headCell}>추정 매매가</th>
              <th className={styles.headCell}>담보부담률</th>
              <th className={styles.headCell}>위험 평가</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className={styles.row}>
                <td className={styles.cell}>{row.label}</td>
                <td className={styles.cell}>{row.price}</td>
                <td className={styles.cell}>{row.rate}</td>
                <td className={styles.cell}>
                  <span className={`${styles.badge} ${styles[row.verdictTone]}`}>
                    {row.verdictLabel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && <p className={styles.note}>{note}</p>}
    </div>
  );
}
