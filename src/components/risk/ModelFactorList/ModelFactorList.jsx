import { FiBarChart2 } from 'react-icons/fi';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import styles from './ModelFactorList.module.css';

function FactorTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{item.label}</p>
      <p className={styles.tooltipValue}>{item.score} / {item.max}점</p>
    </div>
  );
}

export default function ModelFactorList({ title, factors }) {
  const chartData = factors.map((factor) => ({
    ...factor,
    percent: factor.max ? Math.max(0, Math.min(100, (factor.score / factor.max) * 100)) : 0,
  }));

  return (
    <div className={styles.card}>
      <p className={styles.title}>
        <FiBarChart2 aria-hidden="true" />
        {title}
      </p>
      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 22, bottom: 4, left: 4 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="label"
              width={92}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#666', fontSize: 12, fontWeight: 600 }}
            />
            <Tooltip content={<FactorTooltip />} cursor={{ fill: 'rgba(15, 117, 189, 0.06)' }} />
            <Bar dataKey="percent" fill="#0F75BD" radius={[0, 6, 6, 0]} background={{ fill: '#F3F4F6', radius: 6 }} animationDuration={600} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.values}>
        {chartData.map((factor) => (
          <span key={factor.label}>{factor.label} {factor.score} / {factor.max}점</span>
        ))}
      </div>
    </div>
  );
}
