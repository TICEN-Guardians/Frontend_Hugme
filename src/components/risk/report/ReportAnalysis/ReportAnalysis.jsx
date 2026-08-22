import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  LuChartNoAxesColumnIncreasing,
  LuFileCheck,
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
            <span key={chip.label} className={styles.metricChip}>
              <span>{chip.label}</span>
              {chip.help && <TermHelp label={chip.label} description={chip.help} />}
              <strong>{chip.value}</strong>
            </span>
          ))}
        </div>
      </section>

      <ReportSection index="01" icon={<LuTrendingDown />} title="가격 위험 분석" motionSet={motionSet}>
        <PriceRiskSection report={report} />
      </ReportSection>
      <ReportSection index="02" icon={<LuChartNoAxesColumnIncreasing />} title="주변 전세 실거래 분포" motionSet={motionSet}>
        <MarketComparableSection comparable={report.marketComparables} />
      </ReportSection>

      <ReportSection index="03" icon={<LuFileCheck />} title="시세 산출 데이터 품질" motionSet={motionSet}>
        <DataQualitySection quality={report.dataQuality} />
      </ReportSection>

      {report.isDetailed && (
        <ReportSection index="04" icon={<LuShieldCheck />} title="담보 · 등기 분석" motionSet={motionSet}>
          <RecoveryRegistrySection report={report} />
        </ReportSection>
      )}

      <ReportSection index={report.isDetailed ? '05' : '04'} icon={<LuChartNoAxesColumnIncreasing />} title="위험 점수 구성" motionSet={motionSet}>
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
            {report.reliabilityLabel && (
              <span className={styles.reliabilityBadge}>
                시세 신뢰도 {report.reliabilityLabel}
                <TermHelp label="시세 신뢰도" description={report.reliabilityHelp} />
              </span>
            )}
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
            <h3 className={styles.titleWithHelp}>
              가격 하락 시나리오
              <TermHelp label="가격 하락 시나리오" description="AI 예상 매매가가 하락한다고 가정했을 때 담보부담률이 어떻게 변하는지 계산한 값입니다." />
            </h3>
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
      {report.depositRecommendation && (
        <DepositRecommendationCard recommendation={report.depositRecommendation} />
      )}
    </>
  );
}

function DepositRecommendationCard({ recommendation }) {
  return (
    <div className={`${styles.depositRecommendation} ${recommendation.withinLimit ? styles.withinLimit : ''}`}>
      <div className={styles.depositRecommendationHeading}>
        <div>
          <span>서비스 점수 기준 권장 보증금 상한</span>
          <TermHelp
            label="권장 보증금 상한"
            description="현재 분석의 가격 위험점수가 낮음 구간인 25점 이하가 되도록 기존 점수 규칙을 역산한 최대 보증금입니다."
          />
        </div>
        <strong>{recommendation.recommendedLimitLabel}</strong>
      </div>

      <div className={styles.depositRecommendationBody}>
        <div className={styles.depositAdjustment}>
          <span>현재 {recommendation.currentDepositLabel}</span>
          <strong aria-hidden="true">→</strong>
          <span>권장 {recommendation.recommendedLimitLabel}</span>
        </div>
        <div>
          <h3>{recommendation.title}</h3>
          <p>{recommendation.description}</p>
          <span className={styles.calculationBasis}>{recommendation.basisLabel}</span>
        </div>
      </div>

      {recommendation.provisional && (
        <p className={styles.recommendationNotice}>
          <LuTriangleAlert aria-hidden="true" />
          등기 권리관계를 반영하지 않은 잠정 상한입니다. 정밀진단 결과에서는 상한이 낮아질 수 있습니다.
        </p>
      )}
      {!recommendation.adjustmentCanResolveFinalRisk && recommendation.unresolvedReasons.length > 0 && (
        <p className={`${styles.recommendationNotice} ${styles.dangerNotice}`}>
          <LuTriangleAlert aria-hidden="true" />
          보증금을 조정해도 {recommendation.unresolvedReasons.join(', ')} 항목이 해소되지 않으면 최종 위험등급은 내려가지 않습니다.
        </p>
      )}
    </div>
  );
}
function MarketComparableSection({ comparable }) {
  if (!comparable.available) {
    return (
      <div className={styles.comparableUnavailable}>
        <LuTriangleAlert aria-hidden="true" />
        <div>
          <strong>{comparable.statusTitle}</strong>
          <p>{comparable.statusDescription}</p>
          <span>출처 · {comparable.sourceLabel}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.comparablePanel}>
      <div className={styles.comparableHeader}>
        <div>
          <h3>내 보증금은 주변 실거래에서 어느 위치인가요?</h3>
          <p>{comparable.description}</p>
        </div>
        <span className={styles.comparableScope}>{comparable.scopeLabel}</span>
      </div>

      <div className={styles.comparableContent}>
        <div className={styles.comparableChart}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparable.bins} margin={{ top: 34, right: 24, bottom: 8, left: 0 }}>
              <CartesianGrid stroke="#edf2f7" vertical={false} />
              <XAxis
                type="number"
                dataKey="midpoint"
                domain={comparable.domain}
                tickFormatter={compactMoney}
                tick={{ fontSize: 12, fill: '#687486' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: '#8a94a3' }}
                axisLine={false}
                tickLine={false}
                width={34}
              />
              <Tooltip
                formatter={(value) => [`${value}건`, '전세 계약']}
                labelFormatter={(value, payload) => (
                  payload?.[0]?.payload?.rangeLabel ?? shortMoney(value)
                )}
                contentStyle={{ fontSize: '13px', borderRadius: '10px', borderColor: '#dfe5eb' }}
              />
              <ReferenceLine
                x={comparable.depositValue}
                stroke="#d94841"
                strokeWidth={2}
                strokeDasharray="5 4"
                label={{
                  value: `내 보증금 ${comparable.depositShortLabel}`,
                  position: 'top',
                  fill: '#b42318',
                  fontSize: 12,
                  fontWeight: 750,
                }}
              />
              <Bar dataKey="count" fill="#5b9bd5" radius={[5, 5, 0, 0]} isAnimationActive animationDuration={650} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.comparableStats}>
          {comparable.statistics.map((item) => (
            <div key={item.label} className={item.emphasis ? styles.comparableStatEmphasis : ''}>
              <span>
                {item.label}
                {item.help && <TermHelp label={item.label} description={item.help} />}
              </span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.comparableMeta}>
        <span>비교 표본 <strong>{comparable.sampleCount.toLocaleString('ko-KR')}건</strong></span>
        <span>계약 기간 <strong>{comparable.periodLabel}</strong></span>
        <span>면적 범위 <strong>{comparable.areaRangeLabel}</strong></span>
        <span>출처 <strong>{comparable.sourceLabel}</strong></span>
      </div>
      {comparable.warning && <p className={styles.comparableWarning}>{comparable.warning}</p>}
    </div>
  );
}

function DataQualitySection({ quality }) {
  return (
    <div className={`${styles.dataQualityPanel} ${styles[quality.tone]}`}>
      <div className={styles.dataQualitySummary}>
        <div>
          <span>AI 시세 신뢰도</span>
          <TermHelp label="AI 시세 신뢰도" description={quality.help} />
        </div>
        <strong>{quality.label}</strong>
        <p>{quality.summary}</p>
      </div>

      {quality.hasIssues ? (
        <div className={styles.dataQualityDetails}>
          {quality.warningItems.length > 0 && (
            <div>
              <h3>원천 데이터 확인사항</h3>
              <ul>
                {quality.warningItems.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          )}
          {quality.fallbackItems.length > 0 && (
            <div>
              <h3>대체값을 사용한 예측 Feature</h3>
              <ul>
                {quality.fallbackItems.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.dataQualityClear}>
          <LuShieldCheck aria-hidden="true" />
          <span>저장된 분석 결과에서 별도의 데이터 품질 경고를 확인하지 못했습니다.</span>
        </div>
      )}
    </div>
  );
}
function TermHelp({ label, description }) {
  return (
    <span
      className={styles.termHelp}
      tabIndex="0"
      role="img"
      aria-label={`${label}: ${description}`}
      data-tooltip={description}
    >
      ?
    </span>
  );
}

function RecoveryRegistrySection({ report }) {
  return (
    <>
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
                <dt>
                  {row.label}
                  {row.help && <TermHelp label={row.label} description={row.help} />}
                </dt>
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
                  {item.help && <TermHelp label={item.label} description={item.help} />}
                </span>
                <span className={styles.registryDetail}>{item.detail}</span>
                <span className={`${styles.registryBadge} ${styles[item.state]}`}>{item.statusIcon} {item.statusLabel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <RegistryVerificationDetails verification={report.registryVerification} />
    </>
  );
}

function RegistryVerificationDetails({ verification }) {
  if (!verification) return null;

  return (
    <div className={styles.verificationPanel}>
      <div className={styles.verificationHeader}>
        <span>
          <LuFileCheck aria-hidden="true" />
          등기 검증 정보
        </span>
        <strong>저장된 등기 원문 기준</strong>
      </div>
      <dl className={styles.verificationGrid}>
        {verification.rows.map((row) => (
          <div key={row.label}>
            <dt>
              {row.label}
              {row.help && <TermHelp label={row.label} description={row.help} />}
            </dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      {verification.evidence.length > 0 && (
        <div className={styles.evidenceArea}>
          <h4>권리 판단 근거 위치</h4>
          <div className={styles.evidenceRows}>
            {verification.evidence.map((item) => (
              <div key={item.key} className={styles.evidenceRow}>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </div>
                <em>{item.sources}</em>
              </div>
            ))}
          </div>
        </div>
      )}
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
        index={report.isDetailed ? '06' : '05'}
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
