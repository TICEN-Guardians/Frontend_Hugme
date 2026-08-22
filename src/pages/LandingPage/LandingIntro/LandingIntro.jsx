import { motion, useReducedMotion } from 'framer-motion';
import { FiHome } from 'react-icons/fi';
import styles from './LandingIntro.module.css';

const ENTRY_EASE = [0.16, 1, 0.3, 1];

export default function LandingIntro() {
  const prefersReducedMotion = useReducedMotion();
  const delay = (value) => (prefersReducedMotion ? 0 : value);
  const textEntry = {
    initial: { opacity: 0, y: prefersReducedMotion ? 0 : 14, filter: prefersReducedMotion ? 'blur(0px)' : 'blur(5px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  };

  return (
    <section className={styles.intro} aria-label="HUGME 소개">
      <div className={styles.center}>
        <motion.h1
          className={styles.welcome}
          {...textEntry}
          transition={{ duration: prefersReducedMotion ? 0.2 : 0.65, delay: delay(0.35), ease: ENTRY_EASE }}
        >
          <span className={styles.brandHug}>HUG</span><span className={styles.brandMe}>ME</span><span className={styles.welcomeRest}>에 오신 것을 환영합니다</span>
        </motion.h1>
        <motion.div
          className={styles.homeIcon}
          aria-hidden="true"
          initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: prefersReducedMotion ? 0.2 : 0.55,
            delay: delay(0.72),
            ease: ENTRY_EASE,
          }}
        >
          <FiHome />
        </motion.div>
        <motion.p className={styles.lead} {...textEntry} transition={{ duration: 0.48, delay: delay(1), ease: ENTRY_EASE }}>위치도 좋고, 가격도 괜찮다.</motion.p>
        <motion.p className={styles.pause} {...textEntry} transition={{ duration: 0.42, delay: delay(1.28), ease: ENTRY_EASE }}>그런데,</motion.p>
        <motion.h2 className={styles.title} {...textEntry} transition={{ duration: 0.55, delay: delay(1.5), ease: ENTRY_EASE }}>이 집, 정말 계약해도 괜찮을까?</motion.h2>
      </div>
    </section>
  );
}
