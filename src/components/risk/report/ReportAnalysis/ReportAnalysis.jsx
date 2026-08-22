import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  LuChartNoAxesColumnIncreasing,
  LuLandmark,
  LuShieldCheck,
  LuSparkles,
  LuTriangleAlert,
  LuTrendingDown,
} from 'react-icons/lu';
import styles from './ReportAnalysis.module.css';

const VIEWPORT = { once: true, amount: 0.15 };

export default function ReportAnalysis({ report, motionSet }) {
  return (
    <motion.main
      className={styles.analysis}
      initial={motionSet.main.hidden}
      animate={motionSet.main.visible}
      transition={motionSet.main.visible.transition}
    >
      <section className={styles.conclusion}>
        <p className={styles.conclusionLabel}>
          <LuSparkles aria-hidden="true" />
          AI 분석 결론
        </p>
        <p className={styles.conclusionHeadline}>{report.conclusionHeadline}</p>
        {report.conclusionDescription && (
          <p className={styles.conclusionDescription}>{report.conclusionDescription}</p>
        )}
        <div className={styles.metricChips}>
          {report.metricChips.map((chip) => (
            <span key={chip.label} className={styles.metricChip}>{chip.label} {chip.value}</span>
          ))}
        </div>
      </section>

      <ReportSection index="01" icon={<LuTrendingDown />} title="가격 위험 분석" motionSet={motionSet}>
        <PriceRiskSection report={report} />
      </ReportSection>

      {report.isDetailed && (
        <ReportSection index="02" icon={<LuShieldCheck />} title="담보 · 등기 분석" motionSet={motionSet}>
          <RecoveryRegistrySection report={report} />
        </ReportSection>
      )}

      <ReportSection index={report.isDetailed ? '03' : '02'} icon={<LuChartNoAxesColumnIncreasing />} title="위험 점수 구성" motionSet={motionSet}>
        <RiskBreakdownSection report={report} />
      </ReportSection>

      <BottomAnalysis report={report} motionSet={motionSet} />
    </motion.main>
  );
}

function ReportSection({ index, icon, title, motionSet, children }) {
  return (
    <motion.section
      className={styles.reportSection}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={motionSet.section}
    >
      <SectionTitle index={index} icon={icon} title={title} />
      {children}
    </motion.section>
  );
}

function SectionTitle({ index, icon, title }) {
  return (
    <div className={styles.sectionTitleRow}>
      <span className={styles.sectionIndex}>{index}</span>
      <span className={styles.sectionIcon}>{icon}</span>
      <h2 className={styles.sectionTitle}>{title}</h2>
    </div>
  );
}

function PriceRiskSection({ report }) {
  return (
    <>
      <div className={styles.priceAnalysisGrid}>
        <div className={styles.chartArea}>
          <div className={styles.subHeader}>
            <h3>가격 비교</h3>
            {report.reliabilityLabel && <span className={styles.reliabilityBadge}>시세 신뢰도 {report.reliabilityLabel}</span>}
          </div>
          <div className={styles.priceChart}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.priceBars} margin={{ top: 28, right: 18, bottom: 12, left: 14 }}>
                <CartesianGrid stroke="#f2f5f7" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 13, fill: '#4b5563' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={compactMoney} tick={{ fontSize: 13, fill: '#8a94a3' }} axisLine={false} tickLine={false} width={72} />
                <Tooltip formatter={(value, name, props) => [props.payload.valueLabel, props.payload.label]} contentStyle={{ fontSize: '14px', borderRadius: '10px', borderColor: '#dfe5eb' }} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={650}>
                  <LabelList dataKey="shortLabel" position="top" fill="#374151" fontSize={13} fontWeight={750} />
                  {report.priceBars.map((entry) => <Cell key={entry.label} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {report.scenarios.length > 0 && (
          <div className={styles.scenarioArea}>
            <h3>가격 하락 시나리오</h3>
            <div className={styles.scenarioRows}>
              {report.scenarios.map((scenario) => (
                <div key={scenario.label} className={styles.scenarioRow}>
                  <div>
                    <strong>{scenario.label}</strong>
                    <span>{scenario.price}</span>
                  </div>
                  <span className={styles.scenarioRate}>{scenario.rate}</span>
                  <span className={`${styles.verdict} ${styles[scenario.verdictTone]}`}>{scenario.verdictLabel}</span>
                  <span className={styles.scenarioProgress} aria-hidden="true">
                    <span style={{ width: `${scenario.progressWidth}%` }} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <InsightList insights={report.priceInsights} />
    </>
  );
}

function RecoveryRegistrySection({ report }) {
  return (
    <div className={styles.collateralRegistryGrid}>
      <div>
        <div className={styles.subHeader}>
          <h3>보증금 회수 분석</h3>
          <span className={styles.reliabilityBadge}>담보부담률 {report.collateral.burdenRateLabel}</span>
        </div>

        <div className={styles.recoveryValue}>
          <span>회수 가능 기준액</span>
          <strong>{report.collateral.recoverableLabel}</strong>
        </div>

        <div className={styles.recoveryCompare}>
          <TrackRow label="회수 가능액" value={report.collateral.recoverableLabel} width={report.collateral.recoverableWidth} />
          <TrackRow label="계약 보증금" value={report.collateral.depositLabel} width={report.collateral.depositBaseWidth} excessWidth={report.collateral.excessWidth} />
          {report.collateral.shortfallLabel && (
            <p className={styles.shortfallNote}>
              <LuTriangleAlert aria-hidden="true" />
              {report.collateral.shortfallLabel}
            </p>
          )}
        </div>

        <dl className={styles.recoveryRows}>
          {report.collateral.rows.map((row) => (
            <div key={row.label} className={styles.recoveryRow}>
              <dt>{row.label}</dt>
              <dd className={row.tone === 'danger' ? styles.dangerText : ''}>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className={styles.registryArea}>
        <div className={styles.subHeader}>
          <h3>등기 권리관계</h3>
          <span className={`${styles.registrySummary} ${styles[report.registrySummaryTone]}`}>{report.registrySummary}</span>
        </div>
        <div className={styles.registryRows}>
          {report.registryChecks.map((item) => (
            <div key={item.key} className={styles.registryRow}>
              <span className={styles.registryLabel}>
                <LuLandmark aria-hidden="true" />
                {item.label}
              </span>
              <span className={styles.registryDetail}>{item.detail}</span>
              <span className={`${styles.registryBadge} ${styles[item.state]}`}>{item.statusIcon} {item.statusLabel}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrackRow({ label, value, width, excessWidth = 0 }) {
  return (
    <div className={styles.trackRow}>
      <div className={styles.trackLabel}>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className={styles.track}>
        <span className={styles.trackFill} style={{ width: `${width}%` }} />
        {excessWidth > 0 && <span className={styles.trackExcess} style={{ width: `${excessWidth}%`, left: `${width}%` }} />}
      </div>
    </div>
  );
}

function RiskBreakdownSection({ report }) {
  return (
    <>
      <p className={styles.sectionLead}>
        {report.hasScoreAdjustments
          ? `최종 ${report.totalScore ?? '-'}점은 기본 위험요소와 최종 판정 조정을 반영한 값입니다. 기본 항목은 만점 대비 비율로, 조정 항목은 최종점수에 더해진 점수로 표시합니다.`
          : `총 ${report.totalScore ?? '-'}점은 아래 위험요소를 반영한 값이며, 막대는 항목별 만점 대비 비율을 보여줍니다.`}
      </p>
      <div className={styles.breakdownChart}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={report.contribution} margin={{ top: 12, right: 72, bottom: 12, left: 88 }}>
            <CartesianGrid stroke="#eef1f4" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis dataKey="label" type="category" tick={{ fontSize: 14, fill: '#374151' }} axisLine={false} tickLine={false} width={88} />
            <Tooltip formatter={(value, name, props) => [`${props.payload.ratioLabel} (${props.payload.scoreLabel})`, props.payload.label]} contentStyle={{ fontSize: '14px', borderRadius: '10px', borderColor: '#dfe5eb' }} />
            <Bar dataKey="ratio" radius={[0, 8, 8, 0]} isAnimationActive animationDuration={650}>
              {report.contribution.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
              <LabelList dataKey="ratioLabel" position="right" fill="#111827" fontSize={14} fontWeight={700} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

const PRIMARY_REASON_COUNT = 4;

function BottomAnalysis({ report, motionSet }) {
  const evidence = report.reasonGroups?.evidence ?? [];
  const overflow = evidence.slice(PRIMARY_REASON_COUNT);

  return (
    <motion.div
      className={`${styles.bottomAnalysisGrid} ${overflow.length ? '' : styles.singleColumn}`}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={motionSet.section}
    >
      <InsightSection
        index={report.isDetailed ? '04' : '03'}
        evidence={evidence.slice(0, PRIMARY_REASON_COUNT)}
        cautions={report.reasonGroups?.cautions ?? []}
      />
      {overflow.length > 0 && <MoreInsightSection reasons={overflow} />}
    </motion.div>
  );
}

function ReasonList({ reasons }) {
  return (
    <div className={styles.reasonList}>
      {reasons.map((reason) => (
        <div key={`${reason.label}-${reason.description}`} className={styles.reasonItem}>
          <span className={styles.reasonIcon}>{reason.icon}</span>
          <div>
            <h4>{reason.label}</h4>
            <p>{reason.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function MoreInsightSection({ reasons }) {
  return (
    <section className={styles.actionsColumn}>
      <h3 className={styles.reasonGroupTitle}>그 밖의 분석 근거</h3>
      <ReasonList reasons={reasons} />
    </section>
  );
}

function InsightSection({ index, evidence, cautions }) {
  return (
    <section>
      <SectionTitle index={index} icon={<LuTriangleAlert />} title="왜 위험한가요?" />
      <div className={styles.reasonGroups}>
        <div className={styles.reasonGroup}>
          <h3 className={styles.reasonGroupTitle}>주요 분석 근거</h3>
          <ReasonList reasons={evidence} />
        </div>

        {cautions.length > 0 && (
          <div className={styles.reasonGroup}>
            <h3 className={styles.reasonGroupTitle}>주의가 필요한 사항</h3>
            <div className={styles.cautionList}>
              {cautions.map((item) => (
                <p key={item.description}>
                  <LuTriangleAlert aria-hidden="true" />
                  {item.description}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function InsightList({ insights }) {
  if (!insights.length) return null;

  return (
    <div className={styles.insightList}>
      {insights.map((insight) => (
        <p key={insight.text} className={insight.tone === 'danger' ? styles.dangerText : ''}>
          <LuTriangleAlert aria-hidden="true" />
          {insight.text}
        </p>
      ))}
    </div>
  );
}

function compactMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '';
  if (number >= 100000000) return `${(number / 100000000).toFixed(1)}억`;
  if (number >= 10000) return `${Math.round(number / 10000).toLocaleString('ko-KR')}만`;
  return number.toLocaleString('ko-KR');
}
