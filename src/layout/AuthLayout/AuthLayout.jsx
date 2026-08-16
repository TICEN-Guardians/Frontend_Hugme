import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './AuthLayout.module.css';

const AUTH_IMAGE_SRC = '/images/auth/auth.png';
const LOGO_SRC = '/images/Logo.png';
const ENTRY_EASE = [0.16, 1, 0.3, 1];

export default function AuthLayout({ title, children }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={styles.shell}>
      <section className={styles.visual} aria-label="HUGME 안심 전세 서비스 소개">
        <img src={AUTH_IMAGE_SRC} alt="" className={styles.visualImage} aria-hidden="true" />
        <motion.div
          className={styles.copy}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: ENTRY_EASE }}
        >
          <div className={styles.copyInner}>
            <p className={styles.mainCopy}>
              안심하고 계약하는
              <br />
              <span className={styles.blueText}>현명한</span>{' '}
              <span className={styles.greenText}>전세의 시작</span>
            </p>
            <p className={styles.subCopy}>HUGME가 전세보증금의 안전을 지켜드립니다.</p>
          </div>
        </motion.div>
      </section>

      <section className={styles.content} aria-label={title}>
        <motion.div
          className={styles.contentInner}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 32, scale: prefersReducedMotion ? 1 : 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, ease: ENTRY_EASE }}
        >
          <motion.div
            className={styles.headerRow}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08, ease: ENTRY_EASE }}
          >
            <h1 className={styles.title}>{title}</h1>
            <motion.div
              whileHover={prefersReducedMotion ? undefined : { scale: 1.035 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Link to="/" className={styles.logoLink} aria-label="HUGME 홈으로 이동">
                <img src={LOGO_SRC} alt="Hugme" className={styles.logo} />
              </Link>
            </motion.div>
          </motion.div>
          {children}
        </motion.div>
      </section>
    </div>
  );
}
