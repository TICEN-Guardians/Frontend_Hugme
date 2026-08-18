import { FaCircleInfo } from 'react-icons/fa6';
import styles from './PriceScenarioTable.module.css';

export default function PriceScenarioTable({ title, rows }) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>
        {title} <FaCircleInfo aria-hidden="true" />
      </p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.headCell}>시나리오</th>
            <th className={styles.headCell}>추정 매매가</th>
            <th className={styles.headCell}>담보부담률</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className={styles.row}>
              <td className={styles.cell}>{row.label}</td>
              <td className={styles.cell}>{row.price}</td>
              <td className={styles.cell}>{row.rate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
