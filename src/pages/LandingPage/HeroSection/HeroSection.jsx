import { AnimatePresence, motion } from 'framer-motion';
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

export default function HeroSection({ slide, direction }) {
  return (
    <section className={styles.hero}>
      <AnimatePresence initial={false} mode="wait" custom={direction}>
        <motion.div
          key={slide.id}
          className={styles.content}
          custom={direction}
          variants={heroVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.26, ease: 'easeOut' }}
        >
          <h1 className={styles.title}>
            {slide.heroTitle.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </h1>
          <p className={styles.subtitle}>
            {slide.heroSubtitle.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </p>
          <div className={styles.actions}>
            <Link
              to={slide.to}
              className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.md} ${styles.primaryCta}`}
            >
              {slide.primaryCtaLabel}
            </Link>
            <Link
              to="/products"
              className={`${buttonStyles.button} ${buttonStyles.secondary} ${buttonStyles.md} ${styles.secondaryCta}`}
            >
              {slide.secondaryCtaLabel}
            </Link>
          </div>
          <p className={styles.note}>* 로그인 없이 조건 안내 챗봇 · 기본 체크리스트 바로 사용</p>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
