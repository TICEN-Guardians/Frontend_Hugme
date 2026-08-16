import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FiArrowRight, FiCheck, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import buttonStyles from '../../../components/common/Button/Button.module.css';
import styles from './FeatureCarousel.module.css';

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
  enter: (direction) => ({
    opacity: 0,
    x: direction > 0 ? -34 : 34,
    scale: 0.985,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction > 0 ? 34 : -34,
    scale: 0.985,
  }),
};

const contentVariants = {
  enter: (direction) => ({
    opacity: 0,
    x: direction > 0 ? 34 : -34,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction > 0 ? -34 : 34,
  }),
};

const ctaArrowVariants = {
  rest: { x: 0 },
  hover: { x: 3 },
};

export default function FeatureCarousel({ slides, activeIndex, direction, onPrev, onNext, onGoTo }) {
  const slide = slides[activeIndex];
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className={styles.carousel}>
      <motion.button
        type="button"
        className={`${styles.arrow} ${styles.arrowLeft}`}
        onClick={onPrev}
        aria-label="이전 슬라이드"
        whileHover={prefersReducedMotion ? undefined : { y: -1, scale: 1.04 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <FiChevronLeft aria-hidden="true" />
      </motion.button>

      <div className={styles.slideFrame}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={slide.id}
            className={styles.slide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className={styles.visual}
              custom={direction}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1] }}
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
              custom={direction}
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.label}>
                <span className={styles.labelNumber}>{String(activeIndex + 1).padStart(2, '0')}</span>
                <span>{slide.label.replace(/^[①②③④]\s*/, '')}</span>
              </div>
              <h2 className={styles.featureTitle}>{slide.title}</h2>
              <p className={styles.description}>
                {slide.description.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
              {slide.featurePoints && (
                <ul className={styles.points}>
                  {slide.featurePoints.map((point) => (
                    <li key={point}>
                      <FiCheck aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
              )}
              <motion.div
                className={styles.ctaMotion}
                initial="rest"
                whileHover={prefersReducedMotion ? undefined : 'hover'}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
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
        whileHover={prefersReducedMotion ? undefined : { y: -1, scale: 1.04 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <FiChevronRight aria-hidden="true" />
      </motion.button>

      <div className={styles.dots}>
        {slides.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
            onClick={() => onGoTo(index)}
            aria-label={`${index + 1}번째 슬라이드로 이동`}
          >
            {index === activeIndex && <motion.span layoutId="activeCarouselDot" />}
          </button>
        ))}
      </div>
    </section>
  );
}
