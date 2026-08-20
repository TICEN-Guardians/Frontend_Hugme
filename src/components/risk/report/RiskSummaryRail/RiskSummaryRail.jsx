import { motion } from 'framer-motion';
import { LuCircleDollarSign, LuFileCheck, LuShieldAlert } from 'react-icons/lu';
import styles from './RiskSummaryRail.module.css';

export default function RiskSummaryRail({ summary, motionSet }) {
  return (
    <motion.aside
      className={styles.summaryRail}
      initial={motionSet.rail.hidden}
      animate={motionSet.rail.visible}
      transition={motionSet.rail.visible.transition}
    >
      <div className={styles.scoreBlock}>
        <p className={styles.eyebrow}>
          <LuShieldAlert aria-hidden="true" />
          종합 위험도
        </p>
        <div className={styles.scoreWrap}>
          <strong className={styles.score}>{summary.totalScore ?? '-'}</strong>
          <span className={styles.maxScore}>/ {summary.maxScore ?? 100}</span>
        </div>
        <span className={`${styles.gradeBadge} ${styles[summary.badgeTone]}`}>{summary.badgeLabel}</span>
      </div>

      <div className={styles.divider} />

      <div className={styles.moneyList}>
        <MoneyItem label="AI 예상 매매가" value={summary.saleLabel} />
        <MoneyItem label="계약 보증금" value={summary.depositLabel} />
        <MoneyItem
          label={summary.recoveryTone === 'danger' ? '보증금 회수 부족' : '보증금 회수 상태'}
          value={summary.recoveryStatusLabel}
          tone={summary.recoveryTone}
        />
      </div>

      <div className={styles.divider} />

      <div className={styles.riskBlock}>
        <p className={styles.riskTitle}>
          <LuCircleDollarSign aria-hidden="true" />
          주요 위험
        </p>
        {summary.majorRisks.length ? (
          <ul className={styles.riskList}>
            {summary.majorRisks.map((risk) => <li key={risk}>{risk}</li>)}
          </ul>
        ) : (
          <p className={styles.emptyRisk}>요약할 주요 위험 신호가 없습니다.</p>
        )}
      </div>

      {summary.recommendedActions?.length > 0 && (
        <>
          <div className={styles.divider} />

          <div className={styles.checkBlock}>
            <p className={styles.riskTitle}>
              <LuFileCheck aria-hidden="true" />
              계약 전 확인
            </p>
            <ul className={styles.checkList}>
              {summary.recommendedActions.map((action) => (
                <li key={action.label} title={action.description}>{action.label}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </motion.aside>
  );
}

function MoneyItem({ label, value, tone }) {
  return (
    <div className={styles.moneyItem}>
      <span className={styles.moneyLabel}>{label}</span>
      <strong className={`${styles.moneyValue} ${tone === 'danger' ? styles.dangerText : ''}`}>{value}</strong>
    </div>
  );
}
