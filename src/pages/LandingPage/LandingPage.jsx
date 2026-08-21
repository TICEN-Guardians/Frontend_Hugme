import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Xarrow, { Xwrapper, useXarrow } from 'react-xarrows';

import LandingIntro from './LandingIntro/LandingIntro.jsx';
import StoryCharacters from './StoryCharacters/StoryCharacters.jsx';
import StoryStep from './StoryStep/StoryStep.jsx';
import styles from './LandingPage.module.css';

const INTRO_DURATION_MS = 2000;
const SCENE_EASE = [0.65, 0, 0.35, 1];

const STEPS = [
  { id: 'risk', step: 'STEP 01', title: '전세 안전 확인', accent: 'blue', variant: 'risk' },
  { id: 'checklist', step: 'STEP 02', title: '보증 체크리스트', accent: 'green', variant: 'checklist' },
  { id: 'document', step: 'STEP 03', title: '서류 준비', accent: 'blue', variant: 'document' },
];

const DESKTOP_CONNECTIONS = [
  { start: 'step1-out', end: 'left-turn', showHead: false },
  { start: 'left-turn', end: 'step2-in', showHead: true },
  { start: 'step2-out', end: 'right-turn', showHead: false },
  { start: 'right-turn', end: 'step3-in', showHead: true },
];

const MOBILE_CONNECTIONS = [
  { start: 'step1-out', end: 'step2-in', showHead: true },
  { start: 'step2-out', end: 'step3-in', showHead: true },
];

function StoryConnections({ canvasRef }) {
  const updateXarrow = useXarrow();
  const updateXarrowRef = useRef(updateXarrow);
  updateXarrowRef.current = updateXarrow;
  const [route, setRoute] = useState({
    left: { x: 0, y: 0 },
    right: { x: 0, y: 0 },
    mobile: false,
  });

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let frameId = 0;
    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const canvasRect = canvas.getBoundingClientRect();
        const step1Out = document.getElementById('step1-out')?.getBoundingClientRect();
        const step2In = document.getElementById('step2-in')?.getBoundingClientRect();
        const step2Out = document.getElementById('step2-out')?.getBoundingClientRect();
        const step3In = document.getElementById('step3-in')?.getBoundingClientRect();

        if (step1Out && step2In && step2Out && step3In) {
          setRoute({
            left: {
              x: step1Out.left + step1Out.width / 2 - canvasRect.left,
              y: step2In.top + step2In.height / 2 - canvasRect.top,
            },
            right: {
              x: step3In.left + step3In.width / 2 - canvasRect.left,
              y: step2Out.top + step2Out.height / 2 - canvasRect.top,
            },
            mobile: canvasRect.width <= 767,
          });
        }

        window.requestAnimationFrame(() => updateXarrowRef.current());
      });
    };

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(canvas);
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('orientationchange', scheduleUpdate);
    if (document.fonts?.ready) document.fonts.ready.then(scheduleUpdate).catch(() => {});
    scheduleUpdate();
    const settleTimerIds = [100, 400, 900].map((delay) => window.setTimeout(scheduleUpdate, delay));

    return () => {
      window.cancelAnimationFrame(frameId);
      settleTimerIds.forEach((timerId) => window.clearTimeout(timerId));
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('orientationchange', scheduleUpdate);
    };
  }, [canvasRef]);

  const connections = route.mobile ? MOBILE_CONNECTIONS : DESKTOP_CONNECTIONS;

  return (
    <>
      <span id="left-turn" className={styles.routePoint} style={{ left: route.left.x, top: route.left.y }} />
      <span id="right-turn" className={styles.routePoint} style={{ left: route.right.x, top: route.right.y }} />
      {connections.map(({ start, end, showHead }) => (
        <Xarrow
          key={`${start}-${end}`}
          start={start}
          end={end}
          startAnchor="middle"
          endAnchor="middle"
          path="straight"
          color="#0F75BD"
          strokeWidth={3.2}
          headSize={showHead ? 3.8 : 0}
          showHead={showHead}
          dashness={{ strokeLen: 10, nonStrokeLen: 8, animation: 0 }}
          animateDrawing={false}
          zIndex={2}
          arrowBodyProps={{ strokeLinecap: 'round', strokeLinejoin: 'round' }}
          divContainerStyle={{ pointerEvents: 'none' }}
          SVGcanvasStyle={{ maxWidth: 'none', overflow: 'visible' }}
        />
      ))}
    </>
  );
}

function Thought({ id, className, desktop, mobile }) {
  return (
    <p id={id} className={`${styles.thought} ${className}`}>
      <span className={styles.desktopThought}>{desktop}</span>
      <span className={styles.mobileThought}>{mobile}</span>
    </p>
  );
}

function StoryStage({ prefersReducedMotion }) {
  const canvasRef = useRef(null);

  return (
    <motion.section
      className={styles.storyStage}
      aria-label="HUGME 이용 시나리오"
      initial={{
        x: prefersReducedMotion ? 0 : '105%',
        opacity: prefersReducedMotion ? 0 : 1,
      }}
      animate={{ x: 0, opacity: 1 }}
      transition={{
        duration: prefersReducedMotion ? 0.2 : 1.5,
        ease: SCENE_EASE,
      }}
    >
      <Xwrapper>
        <div ref={canvasRef} className={styles.storyCanvas}>
          <div className={`${styles.stepSlot} ${styles.step1Slot}`}><StoryStep step={STEPS[0]} index={0} /></div>
          <Thought id="thought-1" className={styles.thought1} desktop={<>“위험한 요소는 크게 없네.<br />이 정도면 괜찮겠어.”</>} mobile={<>“이 정도면 괜찮겠어.”</>} />
          <Thought id="thought-2" className={styles.thought2} desktop={<>“보증보험도 가입해야 하는데,<br />내 전셋집엔 어떤 서류가 필요하지?”</>} mobile={<>“보증보험엔 어떤<br />서류가 필요하지?”</>} />
          <div className={`${styles.stepSlot} ${styles.step2Slot}`}><StoryStep step={STEPS[1]} index={1} /></div>
          <Thought id="thought-3" className={styles.thought3} desktop={<>“나는 이 서류들을<br />준비하면 되는구나.”</>} mobile={<>“이 서류들이 필요하구나.”</>} />
          <Thought id="thought-4" className={styles.thought4} desktop={<>“전입세대확인서...?<br />어디서 발급받지?”</>} mobile={<>“이 서류는 어디서 발급받지?”</>} />
          <div className={`${styles.stepSlot} ${styles.step3Slot}`}><StoryStep step={STEPS[2]} index={2} /></div>
          <StoryConnections canvasRef={canvasRef} />
        </div>
      </Xwrapper>
    </motion.section>
  );
}

export default function LandingPage() {
  const [showStory, setShowStory] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const timerId = window.setTimeout(() => setShowStory(true), INTRO_DURATION_MS);
    return () => window.clearTimeout(timerId);
  }, []);

  return (
    <main className={styles.root}>
      <header className={styles.topbar}>
        <Link to="/" className={styles.logoLink} aria-label="HUGME 홈"><img className={styles.logo} src="/images/Logo.png" alt="HUGME" /></Link>
        <nav className={styles.authLinks} aria-label="인증">
          <Link className={styles.loginLink} to="/auth/login">로그인</Link>
          <Link className={styles.signupLink} to="/auth/signup">회원가입</Link>
        </nav>
      </header>

      <AnimatePresence initial={false} mode="sync">
        {!showStory ? (
          <motion.div
            key="intro"
            className={styles.sceneLayer}
            initial={{ x: 0, opacity: 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{
              x: prefersReducedMotion ? 0 : '-105%',
              opacity: prefersReducedMotion ? 0 : 1,
            }}
            transition={{ duration: prefersReducedMotion ? 0.2 : 1.5, ease: SCENE_EASE }}
          >
            <LandingIntro />
          </motion.div>
        ) : (
          <StoryStage key="story" prefersReducedMotion={prefersReducedMotion} />
        )}
      </AnimatePresence>

      <StoryCharacters />
    </main>
  );
}
