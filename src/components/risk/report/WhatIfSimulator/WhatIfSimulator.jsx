import { useEffect, useState } from 'react';
import {
  LuCircleAlert,
  LuRotateCcw,
  LuSlidersHorizontal,
  LuTriangleAlert,
} from 'react-icons/lu';
import styles from './WhatIfSimulator.module.css';

export default function WhatIfSimulator({
  defaults,
  result,
  isLoading,
  error,
  onCalculate,
  onReset,
}) {
  const [depositManwon, setDepositManwon] = useState(
    toManwon(defaults.deposit),
  );
  const [saleDropRate, setSaleDropRate] = useState(0);
  const [leaseDropRate, setLeaseDropRate] = useState(0);
  const [removeMortgage, setRemoveMortgage] = useState(false);
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    setDepositManwon(toManwon(defaults.deposit));
    setSaleDropRate(0);
    setLeaseDropRate(0);
    setRemoveMortgage(false);
    setInputError('');
  }, [defaults.deposit, defaults.activeMaxClaimAmount]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const deposit = Number(depositManwon) * 10_000;
    if (!Number.isFinite(deposit) || deposit <= 0) {
      setInputError('보증금을 1만원 이상 입력해 주세요.');
      return;
    }
    setInputError('');
    onCalculate({
      deposit: Math.round(deposit),
      salePriceDropRate: Number(saleDropRate),
      leasePriceDropRate: Number(leaseDropRate),
      removeActiveMortgage: removeMortgage,
    });
  };

  const handleReset = () => {
    setDepositManwon(toManwon(defaults.deposit));
    setSaleDropRate(0);
    setLeaseDropRate(0);
    setRemoveMortgage(false);
    setInputError('');
    onReset();
  };

  return (
    <div className={styles.simulator}>
      <div className={styles.intro}>
        <div>
          <span className={styles.eyebrow}>
            <LuSlidersHorizontal aria-hidden="true" />
            계약 조건 직접 조정
          </span>
          <h3>조건을 바꾸면 위험점수는 어떻게 달라질까요?</h3>
          <p>
            저장된 AI 시세와 등기 결과를 기준으로 기존 점수 규칙을 다시 계산합니다.
            새 시세를 예측하거나 원본 진단을 변경하지 않습니다.
          </p>
        </div>
        <span className={styles.basisBadge}>
          {defaults.isDetailed ? '등기 반영 시뮬레이션' : '등기 미반영 시뮬레이션'}
        </span>
      </div>

      <form className={styles.controls} onSubmit={handleSubmit}>
        <label className={styles.depositControl}>
          <span>가정할 보증금</span>
          <span className={styles.moneyInput}>
            <input
              type="number"
              min="1"
              step="100"
              value={depositManwon}
              onChange={(event) => setDepositManwon(event.target.value)}
            />
            <em>만원</em>
          </span>
        </label>

        <RangeControl
          label="예상 매매가 하락"
          value={saleDropRate}
          onChange={setSaleDropRate}
        />
        <RangeControl
          label="예상 전세가 하락"
          value={leaseDropRate}
          onChange={setLeaseDropRate}
        />

        {defaults.canRemoveActiveMortgage && (
          <label className={styles.mortgageControl}>
            <input
              type="checkbox"
              checked={removeMortgage}
              onChange={(event) => setRemoveMortgage(event.target.checked)}
            />
            <span>
              활성 선순위 근저당 {defaults.activeMaxClaimAmountLabel} 말소 가정
            </span>
          </label>
        )}

        <div className={styles.actions}>
          <button type="button" className={styles.resetButton} onClick={handleReset}>
            <LuRotateCcw aria-hidden="true" />
            초기화
          </button>
          <button type="submit" className={styles.calculateButton} disabled={isLoading}>
            {isLoading ? '계산 중...' : '시나리오 계산'}
          </button>
        </div>
      </form>

      {(inputError || error) && (
        <p className={styles.error}>
          <LuCircleAlert aria-hidden="true" />
          {inputError || error}
        </p>
      )}

      {result && <ScenarioResult result={result} />}
    </div>
  );
}

function RangeControl({ label, value, onChange }) {
  return (
    <label className={styles.rangeControl}>
      <span>
        {label}
        <strong>{value}%</strong>
      </span>
      <input
        type="range"
        min="0"
        max="50"
        step="1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <span className={styles.rangeLegend}>
        <em>0%</em>
        <em>25%</em>
        <em>50%</em>
      </span>
    </label>
  );
}

function ScenarioResult({ result }) {
  return (
    <div className={styles.result}>
      <div className={styles.scoreComparison}>
        <ScoreCard label="현재 진단" value={result.baseline} />
        <div className={styles.scoreDelta + ' ' + styles[result.changeTone]}>
          <span>점수 변화</span>
          <strong>{result.scoreChangeLabel}</strong>
        </div>
        <ScoreCard label="조정 시나리오" value={result.scenario} emphasis />
      </div>

      <div className={styles.resultMetrics}>
        {result.metrics.map((item) => (
          <div key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      {result.recommendation && (
        <div className={styles.minimumChange}>
          <span>이 시나리오에서 낮음 구간을 위한 보증금 상한</span>
          <strong>{result.recommendation.recommendedLimitLabel}</strong>
          <p>{result.recommendation.title}</p>
        </div>
      )}

      {result.registryBlockersRemain && result.blockerReasons.length > 0 && (
        <p className={styles.blockerNotice}>
          <LuTriangleAlert aria-hidden="true" />
          가격 조건을 조정해도 {result.blockerReasons.join(', ')} 항목은 해소되지 않아
          최종 위험점수 하한이 유지됩니다.
        </p>
      )}
    </div>
  );
}

function ScoreCard({ label, value, emphasis = false }) {
  return (
    <div className={styles.scoreCard + (emphasis ? ' ' + styles.emphasis : '')}>
      <span>{label}</span>
      <strong>{value.score}점</strong>
      <em>{value.gradeLabel}</em>
    </div>
  );
}

function toManwon(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount / 10_000) : '';
}
