import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  FiArrowRight,
  FiCheckCircle,
  FiCheckSquare,
  FiFileText,
  FiHome,
  FiLock,
  FiMessageSquare,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import buttonStyles from '../../../components/common/Button/Button.module.css';
import styles from './HeroSection.module.css';

const heroVariants = {
  enter: (direction) => ({
    opacity: 0,
    y: direction > 0 ? 22 : -22,
  }),
  center: {
    opacity: 1,
    y: 0,
  },
  exit: (direction) => ({
    opacity: 0,
    y: direction > 0 ? -22 : 22,
  }),
};

const heroBackdropVariants = {
  enter: (reducedMotion) => ({
    opacity: 0,
    scale: reducedMotion ? 1 : 1.035,
  }),
  center: {
    opacity: 1,
    scale: 1,
  },
  exit: (reducedMotion) => ({
    opacity: 0,
    scale: reducedMotion ? 1 : 0.985,
  }),
};

const imageHeroItemVariants = {
  hidden: (reducedMotion) => ({
    opacity: 0,
    y: reducedMotion ? 0 : 10,
  }),
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const imageHeroArrowVariants = {
  rest: {
    x: 0,
  },
  hover: {
    x: 3,
  },
};

const imageHeroCtaVariants = {
  rest: {
    y: 0,
  },
  hover: {
    y: -2,
  },
};

const heroBackgrounds = {
  risk: '/images/landing/Landing1.png',
  'doc-chat': '/images/landing/Landing2.png',
  'user-chat': '/images/landing/Landing3.png',
  checklist: '/images/landing/Landing4.png',
};

export default function HeroSection({ slide, direction }) {
  const isRiskSlide = slide.id === 'risk';
  const isDocChatSlide = slide.id === 'doc-chat';
  const isConditionChatSlide = slide.id === 'user-chat';
  const isChecklistSlide = slide.id === 'checklist';
  const isImageHero = isRiskSlide || isDocChatSlide || isConditionChatSlide || isChecklistSlide;
  const prefersReducedMotion = useReducedMotion();
  const BadgeIcon = isChecklistSlide
    ? FiCheckSquare
    : isConditionChatSlide
      ? FiMessageSquare
      : isDocChatSlide
        ? FiFileText
        : FiHome;
  const imageHeroBadgeLabel = isConditionChatSlide
    ? '조건상담 챗봇'
    : isChecklistSlide
      ? '체크리스트'
      : isDocChatSlide
        ? '서류안내 챗봇'
        : '매물 위험도 진단';

  return (
    <section
      className={`${styles.hero} ${isRiskSlide ? styles.landing1Hero : ''} ${
        isDocChatSlide ? styles.landing2Hero : ''
      } ${isConditionChatSlide ? styles.landing3Hero : ''} ${isChecklistSlide ? styles.landing4Hero : ''}`}
    >
      {isImageHero && (
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={slide.id}
            className={styles.imageHeroBackdrop}
            custom={prefersReducedMotion}
            style={{ backgroundImage: `url(${heroBackgrounds[slide.id]})` }}
            variants={heroBackdropVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden="true"
          />
        </AnimatePresence>
      )}
      <AnimatePresence initial={false} mode="wait" custom={direction}>
        <motion.div
          key={slide.id}
          className={`${styles.content} ${isImageHero ? styles.imageHeroContent : ''}`}
          custom={direction}
          variants={heroVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
        >
          {isImageHero && (
            <motion.div
              className={styles.imageHeroBadge}
              custom={prefersReducedMotion}
              variants={imageHeroItemVariants}
              initial="hidden"
              animate="visible"
            >
              <BadgeIcon aria-hidden="true" />
              {imageHeroBadgeLabel}
            </motion.div>
          )}
          <motion.h1
            className={styles.title}
            custom={prefersReducedMotion}
            variants={isImageHero ? imageHeroItemVariants : undefined}
            initial={isImageHero ? 'hidden' : undefined}
            animate={isImageHero ? 'visible' : undefined}
            transition={isImageHero ? { delay: 0.05 } : undefined}
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
            variants={isImageHero ? imageHeroItemVariants : undefined}
            initial={isImageHero ? 'hidden' : undefined}
            animate={isImageHero ? 'visible' : undefined}
            transition={isImageHero ? { delay: 0.1 } : undefined}
          >
            {slide.heroSubtitle.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </motion.p>
          <div className={styles.actions}>
            {isImageHero ? (
              <motion.div
                className={styles.imageHeroCtaMotion}
                variants={imageHeroCtaVariants}
                initial="rest"
                whileHover={prefersReducedMotion ? undefined : 'hover'}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <Link
                  to={slide.to}
                  className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.md} ${styles.primaryCta} ${styles.imageHeroPrimaryCta}`}
                >
                  {slide.primaryCtaLabel}
                  <motion.span
                    className={styles.imageHeroCtaArrow}
                    variants={imageHeroArrowVariants}
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
            {!isImageHero && (
              <Link
                to="/products"
                className={`${buttonStyles.button} ${buttonStyles.secondary} ${buttonStyles.md} ${styles.secondaryCta}`}
              >
                {slide.secondaryCtaLabel}
              </Link>
            )}
          </div>
          <p className={`${styles.note} ${isImageHero ? styles.imageHeroNote : ''}`}>
            {isImageHero ? (
              <>
                {isConditionChatSlide ? (
                  <>
                    <FiCheckCircle className={styles.availableIcon} aria-hidden="true" />
                    로그인 없이 바로 이용 가능
                  </>
                ) : isChecklistSlide ? (
                  <>
                    <FiCheckCircle className={styles.availableIcon} aria-hidden="true" />
                    <span>기본 체크리스트 바로 이용</span>
                    <span className={styles.noteDivider} aria-hidden="true">
                      ·
                    </span>
                    <FiLock className={styles.lockIcon} aria-hidden="true" />
                    <span>맞춤 서류 확인은 로그인 필요</span>
                  </>
                ) : (
                  <>
                    <FiLock aria-hidden="true" />
                    로그인 후 이용 가능
                  </>
                )}
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
