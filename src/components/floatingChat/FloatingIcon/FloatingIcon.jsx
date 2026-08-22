import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import FloatingChatGlyph from './FloatingChatGlyph.jsx';
import styles from './FloatingIcon.module.css';

const ENTRY_EASE = [0.16, 1, 0.3, 1];
const TOOLTIP_INTERVAL_MS = 30000; // 주기
const TOOLTIP_VISIBLE_MS = 4000; // 노출 시간

const TOOLTIP_MESSAGES = [
  '보증상품 궁금하지않으세요?',
  '전세사기 예방, 1분만 물어보세요',
  '매물이 안전한지 확인해볼까요?',
  '궁금한게 있으면 편하게 물어보세요',
];

export default function FloatingIcon({
  onOpen,
  showTooltip = true,
  ariaLabel = '상담 챗봇 열기',
  mode = 'floating',
  buttonRef,
  dragHandlers,
}) {
  const prefersReducedMotion = useReducedMotion();
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [tooltipIndex, setTooltipIndex] = useState(0);

  useEffect(() => {
    if (!showTooltip) return undefined;

    const revealTooltip = () => {
      setTooltipIndex(prev => (prev + 1) % TOOLTIP_MESSAGES.length);
      setIsTooltipVisible(true);
      window.setTimeout(() => setIsTooltipVisible(false), TOOLTIP_VISIBLE_MS);
    };

    const intervalId = window.setInterval(revealTooltip, TOOLTIP_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [showTooltip]);

  if (mode === 'landing') {
    return (
      <div className={`${styles.wrap} ${styles.landingWrap}`}>
        <button
          type="button"
          className={`${styles.button} ${styles.landingButton}`}
          onClick={onOpen}
          aria-label="상담 챗봇 열기"
        >
          <FloatingChatGlyph />
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.wrap} ${mode === 'docked' ? styles.dockedWrap : ''}`}>
      <AnimatePresence>
        {isTooltipVisible && (
          <motion.div
            className={styles.tooltip}
            initial={{
              opacity: 0,
              y: prefersReducedMotion ? 0 : 8,
              scale: prefersReducedMotion ? 1 : 0.94,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: prefersReducedMotion ? 0 : 8,
              scale: prefersReducedMotion ? 1 : 0.94,
            }}
            transition={{ duration: 0.32, ease: ENTRY_EASE }}
            onClick={onOpen}
            role="button"
            tabIndex={0}
          >
            {TOOLTIP_MESSAGES[tooltipIndex]}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={buttonRef}
        type="button"
        className={styles.button}
        onClick={onOpen}
        aria-label={ariaLabel}
        {...dragHandlers}
        initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: prefersReducedMotion ? 0.2 : 0.5, ease: ENTRY_EASE }}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
      >
        <FloatingChatGlyph />
      </motion.button>
    </div>
  );
}
