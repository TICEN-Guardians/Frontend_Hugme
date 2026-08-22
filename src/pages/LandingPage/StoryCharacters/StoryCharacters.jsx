import { useRef } from 'react';
import { motion, useDragControls, useReducedMotion } from 'framer-motion';
import FloatingChatWidget from '../../../components/floatingChat/FloatingChatWidget.jsx';
import styles from './StoryCharacters.module.css';

export default function StoryCharacters() {
  const layerRef = useRef(null);
  const pointerStartRef = useRef(null);
  const suppressClickRef = useRef(false);
  const dragControls = useDragControls();
  const prefersReducedMotion = useReducedMotion();

  const handlePointerDown = (event) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    suppressClickRef.current = false;
    dragControls.start(event);
  };

  const handlePointerUp = (event) => {
    const start = pointerStartRef.current;
    if (!start) return;
    suppressClickRef.current = Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6;
  };

  const handleClickCapture = (event) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  };

  return (
    <div ref={layerRef} className={styles.assistantLayer} aria-label="드래그 가능한 HUGME 도우미">
      <motion.aside
        className={styles.assistant}
        drag
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={layerRef}
        dragMomentum={false}
        dragElastic={0}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onDragEnd={() => { suppressClickRef.current = true; }}
        onClickCapture={handleClickCapture}
        whileDrag={prefersReducedMotion ? undefined : { scale: 1.025 }}
      >
        <div className={styles.assistantMount}><FloatingChatWidget mode="landing" /></div>
      </motion.aside>
    </div>
  );
}
