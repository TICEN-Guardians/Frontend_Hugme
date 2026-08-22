import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './LandingEnding.module.css';

const ENTRY_EASE = [0.16, 1, 0.3, 1];

export default function LandingEnding() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className={styles.ending} aria-label="HUGME 시작">
      <span id="ending-in" className={styles.endingNode} aria-hidden="true" />
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: prefersReducedMotion ? 0.25 : 0.85, ease: ENTRY_EASE }}
      >
        <p className={styles.eyebrow}>YOUR SAFE HOUSING JOURNEY</p>
        <h2 className={styles.title}>이제 HUGME를 시작해보세요</h2>
        <p className={styles.description}>
          계약 전 매물 위험 확인부터 보증 가입 서류 준비까지,
          <br />
          HUGME가 안전한 계약의 과정을 함께할게요.
        </p>
        <Link className={styles.startButton} to="/main">
          HUGME 시작하기
        </Link>
      </motion.div>
    </section>
  );
}
