import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FiArrowRight, FiCheck, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import buttonStyles from '../../../components/common/Button/Button.module.css';
import styles from './FeatureCarousel.module.css';

const ENTRY_EASE = [0.16, 1, 0.3, 1];
const EXIT_EASE = [0.4, 0, 1, 1];

const slideVariants = {
  enter: () => ({
    opacity: 0,
  }),
  center: {
    opacity: 1,
  },
  exit: () => ({
    opacity: 0,
  }),
};

const imageVariants = {
  enter: ({ direction, reducedMotion }) => ({
    opacity: 0,
    x: reducedMotion ? 0 : direction * 70,
    y: 0,
    scale: reducedMotion ? 1 : 0.985,
  }),
  center: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.95,
      ease: ENTRY_EASE,
    },
  },
  exit: ({ direction, reducedMotion }) => ({
    opacity: 0,
    x: reducedMotion ? 0 : direction * -40,
    scale: reducedMotion ? 1 : 0.99,
    transition: {
      duration: 0.5,
      ease: EXIT_EASE,
    },
  }),
};

const contentVariants = {
  enter: ({ direction, reducedMotion }) => ({
    opacity: 0,
    x: reducedMotion ? 0 : direction * -45,
    y: 0,
  }),
  center: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.9,
      ease: ENTRY_EASE,
      delayChildren: 0.36,
      staggerChildren: 0.075,
    },
  },
  exit: ({ direction, reducedMotion }) => ({
    opacity: 0,
    x: reducedMotion ? 0 : direction * 30,
    transition: {
      duration: 0.48,
      ease: EXIT_EASE,
    },
  }),
};

const detailItemVariants = {
  enter: (reducedMotion) => ({
    opacity: 0,
    y: reducedMotion ? 0 : 20,
  }),
  center: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.68,
      ease: ENTRY_EASE,
    },
  },
};

const ctaMotionVariants = {
  enter: (reducedMotion) => ({
    opacity: 0,
    y: reducedMotion ? 0 : 20,
    scale: 1,
  }),
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.68,
      ease: ENTRY_EASE,
    },
  },
  hover: {
    y: -2,
    scale: 1.01,
  },
};

const ctaArrowVariants = {
  rest: { x: 0 },
  hover: { x: 3 },
};

export default function FeatureCarousel({
  slides,
  activeIndex,
  direction,
  onPrev,
  onNext,
  onGoTo,
}) {
  const slide = slides[activeIndex];
  const prefersReducedMotion = useReducedMotion();
  const motionCustom = { direction, reducedMotion: prefersReducedMotion };

  return (
    <section className={styles.carousel}>
      <motion.button
        type="button"
        className={`${styles.arrow} ${styles.arrowLeft}`}
        onClick={onPrev}
        aria-label="이전 슬라이드"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <FiChevronLeft aria-hidden="true" />
      </motion.button>

      <div className={styles.slideFrame}>
        <AnimatePresence custom={direction}>
          <motion.div
            key={slide.id}
            className={styles.slide}
            custom={motionCustom}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.85, ease: ENTRY_EASE }}
          >
            <motion.div
              className={styles.visual}
              custom={motionCustom}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <img
                className={styles.image}
                src={slide.image}
                alt={slide.title}
                width={650}
                height={380}
              />
            </motion.div>
            <motion.div
              className={styles.content}
              custom={motionCustom}
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <motion.div
                className={styles.label}
                custom={prefersReducedMotion}
                variants={detailItemVariants}
              >
                <span className={styles.labelNumber}>{String(activeIndex + 1).padStart(2, '0')}</span>
                <span>{slide.label.replace(/^[①②③④]\s*/, '')}</span>
              </motion.div>
              <motion.h2
                className={styles.featureTitle}
                custom={prefersReducedMotion}
                variants={detailItemVariants}
              >
                {slide.title}
              </motion.h2>
              <motion.p
                className={styles.description}
                custom={prefersReducedMotion}
                variants={detailItemVariants}
              >
                {slide.description.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </motion.p>
              {slide.featurePoints && (
                <motion.ul
                  className={styles.points}
                  custom={prefersReducedMotion}
                  variants={detailItemVariants}
                >
                  {slide.featurePoints.map((point) => (
                    <li key={point}>
                      <FiCheck aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </motion.ul>
              )}
              <motion.div
                className={styles.ctaMotion}
                custom={prefersReducedMotion}
                variants={ctaMotionVariants}
                whileHover={prefersReducedMotion ? undefined : 'hover'}
                whileTap={prefersReducedMotion ? undefined : { y: 0, scale: 0.985 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <Link
                  to={slide.to}
                  className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.sm} ${styles.cta}`}
                >
                  {slide.cardCtaLabel}
                  <motion.span
                    className={styles.ctaArrow}
                    variants={ctaArrowVariants}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    aria-hidden="true"
                  >
                    <FiArrowRight />
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.button
        type="button"
        className={`${styles.arrow} ${styles.arrowRight}`}
        onClick={onNext}
        aria-label="다음 슬라이드"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <FiChevronRight aria-hidden="true" />
      </motion.button>

      <motion.div
        className={styles.dots}
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: ENTRY_EASE }}
      >
        {slides.map((item, index) => (
          <motion.button
            key={item.id}
            type="button"
            layout
            className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
            onClick={() => onGoTo(index)}
            aria-label={`${index + 1}번째 슬라이드로 이동`}
            transition={{ duration: 0.35, ease: ENTRY_EASE }}
          >
            {index === activeIndex && <motion.span layoutId="activeCarouselDot" />}
          </motion.button>
        ))}
      </motion.div>
    </section>
  );
}
