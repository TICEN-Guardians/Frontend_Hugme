import { motion, useReducedMotion } from 'framer-motion';
import { FiHome } from 'react-icons/fi';
import styles from './LandingIntro.module.css';

const ENTRY_EASE = [0.16, 1, 0.3, 1];

export default function LandingIntro() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className={styles.intro} aria-label="HUGME 소개">
      <motion.div
        className={styles.center}
        initial={{
          opacity: 0,
          filter: prefersReducedMotion ? 'blur(0px)' : 'blur(7px)',
          scale: prefersReducedMotion ? 1 : 0.985,
        }}
        animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
        transition={{ duration: prefersReducedMotion ? 0.2 : 0.58, ease: ENTRY_EASE }}
      >
        <h1 className={styles.welcome}><span>HUGME</span>에 오신 것을 환영합니다</h1>
        <motion.div
          className={styles.homeIcon}
          aria-hidden="true"
          initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: prefersReducedMotion ? 0.2 : 0.48,
            delay: prefersReducedMotion ? 0 : 0.12,
            ease: ENTRY_EASE,
          }}
        >
          <FiHome />
        </motion.div>
        <p className={styles.lead}>위치도 좋고, 가격도 괜찮다.</p>
        <p className={styles.pause}>그런데,</p>
        <h2 className={styles.title}>이 집, 정말 계약해도 괜찮을까?</h2>
      </motion.div>
    </section>
  );
}
