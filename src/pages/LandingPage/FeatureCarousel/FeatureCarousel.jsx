import { AnimatePresence, motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaLock } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import buttonStyles from '../../../components/common/Button/Button.module.css';
import styles from './FeatureCarousel.module.css';

const slideVariants = {
  enter: (direction) => ({
    opacity: 0,
    x: direction > 0 ? 80 : -80,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction > 0 ? -80 : 80,
  }),
};

export default function FeatureCarousel({ slides, activeIndex, direction, onPrev, onNext, onGoTo }) {
  const slide = slides[activeIndex];

  return (
    <section className={styles.carousel}>
      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowLeft}`}
        onClick={onPrev}
        aria-label="이전 슬라이드"
      >
        <FaChevronLeft aria-hidden="true" />
      </button>

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
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              className={styles.image}
              src={slide.image}
              alt={slide.title}
              width={420}
              height={290}
            />
            <div className={styles.content}>
              <div className={styles.label}>{slide.label}</div>
              <h2 className={styles.featureTitle}>{slide.title}</h2>
              <p className={styles.description}>
                {slide.description.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
              <Link
                to={slide.to}
                className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.sm} ${styles.cta}`}
              >
                <FaLock aria-hidden="true" />
                로그인하고 진단
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowRight}`}
        onClick={onNext}
        aria-label="다음 슬라이드"
      >
        <FaChevronRight aria-hidden="true" />
      </button>

      <div className={styles.dots}>
        {slides.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
            onClick={() => onGoTo(index)}
            aria-label={`${index + 1}번째 슬라이드로 이동`}
          />
        ))}
      </div>
    </section>
  );
}
