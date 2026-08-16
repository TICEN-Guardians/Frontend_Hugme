import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FiArrowRight, FiHome, FiLock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import buttonStyles from '../../../components/common/Button/Button.module.css';
import styles from './HeroSection.module.css';

const heroVariants = {
  enter: (direction) => ({
    opacity: 0,
    y: direction > 0 ? 18 : -18,
  }),
  center: {
    opacity: 1,
    y: 0,
  },
  exit: (direction) => ({
    opacity: 0,
    y: direction > 0 ? -18 : 18,
  }),
};

const riskItemVariants = {
  hidden: (reducedMotion) => ({
    opacity: 0,
    y: reducedMotion ? 0 : 8,
  }),
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.38,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const riskArrowVariants = {
  rest: {
    x: 0,
  },
  hover: {
    x: 3,
  },
};

const riskCtaVariants = {
  rest: {
    y: 0,
  },
  hover: {
    y: -2,
  },
};

export default function HeroSection({ slide, direction }) {
  const isRiskSlide = slide.id === 'risk';
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className={`${styles.hero} ${isRiskSlide ? styles.landing1Hero : ''}`}>
      <AnimatePresence initial={false} mode="wait" custom={direction}>
        <motion.div
          key={slide.id}
          className={`${styles.content} ${isRiskSlide ? styles.landing1Content : ''}`}
          custom={direction}
          variants={heroVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.26, ease: 'easeOut' }}
        >
          {isRiskSlide && (
            <motion.div
              className={styles.riskBadge}
              custom={prefersReducedMotion}
              variants={riskItemVariants}
              initial="hidden"
              animate="visible"
            >
              <FiHome aria-hidden="true" />
              매물 위험도 진단
            </motion.div>
          )}
          <motion.h1
            className={styles.title}
            custom={prefersReducedMotion}
            variants={isRiskSlide ? riskItemVariants : undefined}
            initial={isRiskSlide ? 'hidden' : undefined}
            animate={isRiskSlide ? 'visible' : undefined}
            transition={isRiskSlide ? { delay: 0.05 } : undefined}
          >
            {slide.heroTitle.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </motion.h1>
          <motion.p
            className={styles.subtitle}
            custom={prefersReducedMotion}
            variants={isRiskSlide ? riskItemVariants : undefined}
            initial={isRiskSlide ? 'hidden' : undefined}
            animate={isRiskSlide ? 'visible' : undefined}
            transition={isRiskSlide ? { delay: 0.1 } : undefined}
          >
            {slide.heroSubtitle.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </motion.p>
          <div className={styles.actions}>
            {isRiskSlide ? (
              <motion.div
                className={styles.riskCtaMotion}
                variants={riskCtaVariants}
                initial="rest"
                whileHover={prefersReducedMotion ? undefined : 'hover'}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <Link
                  to={slide.to}
                  className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.md} ${styles.primaryCta} ${styles.riskPrimaryCta}`}
                >
                  매물 위험도 진단하기
                  <motion.span
                    className={styles.riskCtaArrow}
                    variants={riskArrowVariants}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    aria-hidden="true"
                  >
                    <FiArrowRight />
                  </motion.span>
                </Link>
              </motion.div>
            ) : (
              <Link
                to={slide.to}
                className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.md} ${styles.primaryCta}`}
              >
                {slide.primaryCtaLabel}
              </Link>
            )}
            {!isRiskSlide && (
              <Link
                to="/products"
                className={`${buttonStyles.button} ${buttonStyles.secondary} ${buttonStyles.md} ${styles.secondaryCta}`}
              >
                {slide.secondaryCtaLabel}
              </Link>
            )}
          </div>
          <p className={`${styles.note} ${isRiskSlide ? styles.riskNote : ''}`}>
            {isRiskSlide ? (
              <>
                <FiLock aria-hidden="true" />
                로그인 후 이용 가능
              </>
            ) : (
              <>* {slide.heroNote}</>
            )}
          </p>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
