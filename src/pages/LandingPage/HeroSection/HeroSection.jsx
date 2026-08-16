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

const ENTRY_EASE = [0.16, 1, 0.3, 1];
const EXIT_EASE = [0.4, 0, 1, 1];

const heroVariants = {
  enter: ({ reducedMotion }) => ({
    opacity: 0,
    y: reducedMotion ? 0 : 28,
  }),
  center: {
    opacity: 1,
    y: 0,
    transition: {
      delayChildren: 0.12,
      staggerChildren: 0.08,
    },
  },
  exit: () => ({
    opacity: 0,
    y: -18,
    transition: {
      duration: 0.48,
      ease: EXIT_EASE,
    },
  }),
};

const heroBackdropVariants = {
  enter: ({ reducedMotion }) => ({
    opacity: 0,
    scale: reducedMotion ? 1 : 1.025,
  }),
  center: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.15,
      ease: ENTRY_EASE,
    },
  },
  exit: ({ reducedMotion }) => ({
    opacity: 0,
    scale: reducedMotion ? 1 : 1.01,
    transition: {
      duration: 0.6,
      ease: EXIT_EASE,
    },
  }),
};

const imageHeroItemVariants = {
  enter: ({ reducedMotion }) => ({
    opacity: 0,
    y: reducedMotion ? 0 : 28,
  }),
  center: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.78,
      ease: ENTRY_EASE,
    },
  },
};

const imageHeroTitleVariants = {
  enter: ({ reducedMotion }) => ({
    opacity: 0,
    y: reducedMotion ? 0 : 34,
  }),
  center: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.85,
      ease: ENTRY_EASE,
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
    scale: 1,
  },
  hover: {
    y: -2,
    scale: 1.01,
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
  const motionCustom = { direction, reducedMotion: prefersReducedMotion };
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
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={slide.id}
            className={styles.imageHeroBackdrop}
            custom={motionCustom}
            style={{ backgroundImage: `url(${heroBackgrounds[slide.id]})` }}
            variants={heroBackdropVariants}
            initial="enter"
            animate="center"
            exit="exit"
            aria-hidden="true"
          />
        </AnimatePresence>
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          className={`${styles.content} ${isImageHero ? styles.imageHeroContent : ''}`}
          custom={motionCustom}
          variants={heroVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.85, ease: ENTRY_EASE }}
        >
          {isImageHero && (
            <motion.div
              className={styles.imageHeroBadge}
              custom={motionCustom}
              variants={imageHeroItemVariants}
            >
              <BadgeIcon aria-hidden="true" />
              {imageHeroBadgeLabel}
            </motion.div>
          )}
          <motion.h1
            className={styles.title}
            custom={motionCustom}
            variants={isImageHero ? imageHeroTitleVariants : undefined}
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
            custom={motionCustom}
            variants={isImageHero ? imageHeroItemVariants : undefined}
          >
            {slide.heroSubtitle.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </motion.p>
          <motion.div
            className={styles.actions}
            custom={motionCustom}
            variants={isImageHero ? imageHeroItemVariants : undefined}
          >
            {isImageHero ? (
              <motion.div
                className={styles.imageHeroCtaMotion}
                variants={imageHeroCtaVariants}
                initial="rest"
                whileHover={prefersReducedMotion ? undefined : 'hover'}
                whileTap={prefersReducedMotion ? undefined : { y: 0, scale: 0.985 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
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
          </motion.div>
          <motion.p
            className={`${styles.note} ${isImageHero ? styles.imageHeroNote : ''}`}
            custom={motionCustom}
            variants={isImageHero ? imageHeroItemVariants : undefined}
          >
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
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
