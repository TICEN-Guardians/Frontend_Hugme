import { FiBarChart2, FiShield } from 'react-icons/fi';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import styles from './PriceComparisonChart.module.css';

function shortMoney(value) {
  if (!Number.isFinite(Number(value))) return '';

  return `${(Number(value) / 100000000).toFixed(2)}억`;
}

function PriceTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{item.label}</p>
      <p className={styles.tooltipValue}>{item.valueLabel}</p>
    </div>
  );
}

export default function PriceComparisonChart({ title, reliabilityLabel, bars, insights }) {
  return (
    <div className={styles.card}>
      <div className={styles.headRow}>
        <p className={styles.title}>
          <FiBarChart2 aria-hidden="true" />
          {title}
        </p>
        {reliabilityLabel && (
          <span className={styles.reliability}>
            <FiShield aria-hidden="true" />
            시세 신뢰도 {reliabilityLabel}
          </span>
        )}
      </div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bars} margin={{ top: 10, right: 8, bottom: 4, left: 0 }}>
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} />
            <YAxis tickFormatter={shortMoney} axisLine={false} tickLine={false} width={48} tick={{ fill: '#999', fontSize: 11 }} />
            <Tooltip content={<PriceTooltip />} cursor={{ fill: 'rgba(15, 117, 189, 0.05)' }} />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]} animationDuration={600}>
              {bars.map((bar) => (
                <Cell key={bar.label} fill={bar.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.insights}>
        {insights.map((insight) => (
          <p key={insight.text} className={insight.tone === 'danger' ? styles.insightDanger : ''}>
            {insight.text}
          </p>
        ))}
      </div>
    </div>
  );
}
