import {
  FiAlertTriangle, FiCheck, FiFileText, FiHome, FiKey,
  FiMapPin, FiShield, FiTrendingUp, FiUploadCloud,
} from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa6';
import styles from './StoryStep.module.css';

function Anchor({ id, className = '' }) {
  return <span id={id} className={`${styles.anchor} ${className}`} aria-hidden="true" />;
}

function RiskContent() {
  return (
    <div className={styles.riskContent}>
      <p className={styles.question}>이 전셋집, 얼마나 안전할까?</p>
      <div className={styles.keywordGrid} aria-label="안전 확인 항목">
        <span><FiTrendingUp aria-hidden="true" />전세가율</span>
        <span><FiHome aria-hidden="true" />주변 시세</span>
        <span><FiKey aria-hidden="true" />권리관계</span>
        <span><FiAlertTriangle aria-hidden="true" />위험 요소</span>
      </div>
      <div className={styles.statusRow}>
        <span className={styles.shield}><FiShield aria-hidden="true" /><FiCheck aria-hidden="true" /></span>
        <strong>안전한 편</strong>
      </div>
    </div>
  );
}

function ChecklistContent() {
  return (
    <div className={styles.checklistContent}>
      <p className={styles.question}>내 전셋집엔 어떤 서류가 필요할까?</p>
      <div className={styles.documentFlow}>
        <div className={styles.contractBox}><FiFileText aria-hidden="true" /><strong>임대차계약서</strong></div>
        <span className={styles.flowArrow} aria-hidden="true">→</span>
        <div className={styles.compactList}>
          <span><FiCheck aria-hidden="true" />임대차계약서</span>
          <span><FiCheck aria-hidden="true" />주민등록등본</span>
          <span><FiCheck aria-hidden="true" />전입세대확인서</span>
        </div>
      </div>
    </div>
  );
}

function DocumentContent() {
  return (
    <div className={styles.documentContent}>
      <p className={styles.question}>이 서류, 어디서 준비하지?</p>
      <div className={styles.documentModules}>
        <div className={styles.module}>
          <div className={styles.moduleTitle}><FaRobot aria-hidden="true" />서류 안내</div>
          <span><FiMapPin aria-hidden="true" />발급처</span><span className={styles.mobileHidden}>발급 방법 · 준비사항</span>
        </div>
        <span className={styles.flowArrow} aria-hidden="true">→</span>
        <div className={styles.module}>
          <div className={styles.moduleTitle}><FiUploadCloud aria-hidden="true" />준비 확인</div>
          <span><FiFileText aria-hidden="true" />서류 업로드</span><strong><FiCheck aria-hidden="true" />준비 완료</strong>
        </div>
      </div>
    </div>
  );
}

export default function StoryStep({ step, index }) {
  return (
    <article className={`${styles.card} ${styles[step.accent]}`} aria-labelledby={`${step.id}-title`}>
      <header className={styles.cardHeader}><span>{step.step}</span><h2 id={`${step.id}-title`}>{step.title}</h2></header>
      {step.variant === 'risk' && <RiskContent />}
      {step.variant === 'checklist' && <ChecklistContent />}
      {step.variant === 'document' && <DocumentContent />}
      <Anchor id={`step${index + 1}-in`} className={index === 2 ? styles.step3InAnchor : styles.inAnchor} />
      <Anchor id={`step${index + 1}-out`} className={index === 1 ? styles.step2OutAnchor : styles.outAnchor} />
    </article>
  );
}
