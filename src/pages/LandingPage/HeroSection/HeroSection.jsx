import { Link } from 'react-router-dom';
import buttonStyles from '../../../components/common/Button/Button.module.css';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <h1 className={styles.title}>
        공공데이터 기반 AI 진단으로
        <br />
        계약 전 전세보증금 위험도를 확인하세요
      </h1>
      <p className={styles.subtitle}>
        전세 계약 전, 등기·시세·권리관계를 자동으로 분석해
        <br />
        안심하고 계약할 수 있도록 도와드립니다
      </p>
      <div className={styles.actions}>
        <Link
          to="/risk/new"
          className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.md} ${styles.primaryCta}`}
        >
          진단 시작하기
        </Link>
        {/* TODO: "챗봇 상담"이 서류안내(/doc-chat)와 조건상담(/user-chat) 중 어디로 연결돼야 하는지 확인 필요 */}
        <Link
          to="/user-chat"
          className={`${buttonStyles.button} ${buttonStyles.secondary} ${buttonStyles.md} ${styles.secondaryCta}`}
        >
          챗봇 상담
        </Link>
      </div>
      <p className={styles.note}>* 로그인 없이 조건 안내 챗봇 · 기본 체크리스트 바로 사용</p>
    </section>
  );
}
