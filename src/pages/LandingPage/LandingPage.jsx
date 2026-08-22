import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FiCheck, FiFileText, FiMessageCircle, FiShield } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Xarrow, { Xwrapper, useXarrow } from 'react-xarrows';
import LandingIntro from './LandingIntro/LandingIntro.jsx';
import styles from './LandingPage.module.css';

const INTRO_DURATION_MS = 4000;
const SCENE_EASE = [0.65, 0, 0.35, 1];
const FEATURE_REVEAL_DURATION = 0.62;
const FEATURE_HOLD_DURATION = 1.2;
const ROUTE_DRAW_DURATION = 2.35;
const TABLET_ROUTE_DRAW_DURATION = 3.6;
const COMPLETE_REVEAL_DURATION = 0.65;
const START_BUTTON_REVEAL_GAP = 0.5;

const RISK_REVEAL_DELAY = 1.15;
const RISK_ROUTE_DELAY = RISK_REVEAL_DELAY + FEATURE_REVEAL_DURATION + FEATURE_HOLD_DURATION;
const CHECKLIST_REVEAL_DELAY = RISK_ROUTE_DELAY + ROUTE_DRAW_DURATION;
const CHECKLIST_ROUTE_DELAY = CHECKLIST_REVEAL_DELAY + FEATURE_REVEAL_DURATION + FEATURE_HOLD_DURATION;
const PREPARATION_REVEAL_DELAY = CHECKLIST_ROUTE_DELAY + ROUTE_DRAW_DURATION;
const PREPARATION_ROUTE_DELAY = PREPARATION_REVEAL_DELAY + FEATURE_REVEAL_DURATION + FEATURE_HOLD_DURATION;
const COMPLETE_REVEAL_DELAY = PREPARATION_ROUTE_DELAY + ROUTE_DRAW_DURATION;
const TABLET_RISK_ROUTE_DELAY = RISK_REVEAL_DELAY + FEATURE_REVEAL_DURATION + FEATURE_HOLD_DURATION;
const TABLET_CHECKLIST_REVEAL_DELAY = TABLET_RISK_ROUTE_DELAY + TABLET_ROUTE_DRAW_DURATION;
const TABLET_CHECKLIST_ROUTE_DELAY = TABLET_CHECKLIST_REVEAL_DELAY + FEATURE_REVEAL_DURATION + FEATURE_HOLD_DURATION;
const TABLET_PREPARATION_REVEAL_DELAY = TABLET_CHECKLIST_ROUTE_DELAY + TABLET_ROUTE_DRAW_DURATION;
const TABLET_PREPARATION_ROUTE_DELAY = TABLET_PREPARATION_REVEAL_DELAY + FEATURE_REVEAL_DURATION + FEATURE_HOLD_DURATION;
const TABLET_COMPLETE_REVEAL_DELAY = TABLET_PREPARATION_ROUTE_DELAY + TABLET_ROUTE_DRAW_DURATION;
const TABLET_JOURNEY_QUERY = '(min-width: 768px) and (max-width: 1439px)';

const FEATURES = [
  {
    key: 'risk',
    type: 'house',
    icon: 'shield',
    className: styles.riskPoint,
    to: '/risk/new',
    label: '전세 위험도 진단',
    description: '계약 전 집의 위험을 분석해요.\n보증금 회수 가능성을 확인해요.',
    delay: RISK_REVEAL_DELAY,
    tabletDelay: RISK_REVEAL_DELAY,
    exitAnchor: 'riskExit',
  },
  {
    key: 'checklist',
    type: 'document',
    icon: 'document',
    className: styles.checklistPoint,
    to: '/guarantee-checklist',
    label: '보증 체크리스트',
    description: '계약서로 필요한 서류를 골라요.\n맞춤 준비 목록을 확인해요.',
    delay: CHECKLIST_REVEAL_DELAY,
    tabletDelay: TABLET_CHECKLIST_REVEAL_DELAY,
    entryAnchor: 'checklistEntry',
    exitAnchor: 'checklistExit',
  },
  {
    key: 'preparation-guide',
    type: 'robot',
    icon: 'chat',
    className: styles.preparationPoint,
    to: '/doc-chat',
    label: '서류 준비 도우미',
    description: '서류별 발급처와 방법을 안내해요.\n준비한 서류와 남은 서류를 확인해요.',
    delay: PREPARATION_REVEAL_DELAY,
    tabletDelay: TABLET_PREPARATION_REVEAL_DELAY,
    entryAnchor: 'preparationEntry',
    exitAnchor: 'preparationExit',
  },
];

const CONNECTIONS = [
  { start: 'riskExit', end: 'checklistEntry', startAnchor: 'bottom', endAnchor: 'left', delay: RISK_ROUTE_DELAY, tabletDelay: TABLET_RISK_ROUTE_DELAY, duration: ROUTE_DRAW_DURATION, tabletDuration: TABLET_ROUTE_DRAW_DURATION, curveness: 0.95 },
  { start: 'checklistExit', end: 'preparationEntry', startAnchor: 'right', endAnchor: 'left', delay: CHECKLIST_ROUTE_DELAY, tabletDelay: TABLET_CHECKLIST_ROUTE_DELAY, duration: ROUTE_DRAW_DURATION, tabletDuration: TABLET_ROUTE_DRAW_DURATION, curveness: 0.35 },
  { start: 'preparationExit', end: 'completeEntry', startAnchor: 'right', endAnchor: 'bottom', delay: PREPARATION_ROUTE_DELAY, tabletDelay: TABLET_PREPARATION_ROUTE_DELAY, duration: ROUTE_DRAW_DURATION, tabletDuration: TABLET_ROUTE_DRAW_DURATION, curveness: 0.95 },
];

const JOURNEY_BUBBLES = [
  { key: 'risk-to-checklist', text: '안전하네, 계약해야겠다!\n보증보험엔 어떤 서류가 필요하지?', className: styles.riskToChecklistBubble, connectionIndex: 0, tabletProgress: 0.5 },
  { key: 'checklist-to-preparation', text: '필요한 서류는 알겠어.\n발급처와 준비 방법을 알아볼까?', className: styles.checklistToPreparationBubble, connectionIndex: 1, tabletProgress: 0.5 },
  { key: 'preparation-to-complete', text: '발급부터 준비 현황까지 확인했어!\n필요한 서류가 모두 준비됐어.', className: styles.preparationToCompleteBubble, connectionIndex: 2, tabletProgress: 0.5 },
];

const MOBILE_JOURNEY_ITEMS = [
  { key: 'risk', type: 'feature', featureKey: 'risk', initial: true },
  { key: 'risk-to-checklist', type: 'thought', text: '안전하네, 계약해야겠다!\n보증보험엔 어떤 서류가 필요하지?', tone: 'blue' },
  { key: 'checklist', type: 'feature', featureKey: 'checklist' },
  { key: 'checklist-to-preparation', type: 'thought', text: '필요한 서류는 알겠어.\n발급처와 준비 방법을 알아볼까?', tone: 'blue' },
  { key: 'preparation-guide', type: 'feature', featureKey: 'preparation-guide' },
  { key: 'preparation-to-complete', type: 'thought', text: '발급부터 준비 현황까지 확인했어!\n필요한 서류가 모두 준비됐어.', tone: 'blue' },
  { key: 'complete', type: 'complete' },
];

const getRouteKey = ({ start, end }) => `${start}-${end}`;

function ShapeOutline({ type }) {
  if (type === 'house') {
    return (
      <svg className={styles.shapeOutline} viewBox="0 0 300 250" aria-hidden="true">
        <path d="M 30 100 Q 30 90 40 82 L 140 18 Q 150 10 160 18 L 260 82 Q 270 90 270 100 Q 270 108 260 108 H 250 V 220 Q 250 232 238 232 H 62 Q 50 232 50 220 V 108 H 40 Q 30 108 30 100 Z" />
      </svg>
    );
  }

  if (type === 'document') {
    return (
      <svg className={styles.shapeOutline} viewBox="0 0 300 250" aria-hidden="true">
        <path d="M 48 16 H 202 Q 212 16 220 24 L 264 68 Q 272 76 272 88 V 216 Q 272 232 256 232 H 48 Q 30 232 30 214 V 34 Q 30 16 48 16 Z" />
        <path className={styles.foldLine} d="M 212 18 V 66 Q 212 76 222 76 H 270" />
      </svg>
    );
  }

  return (
    <svg className={styles.shapeOutline} viewBox="0 -22 300 272" aria-hidden="true">
      <path className={styles.antennaLine} d="M 150 24 V -2" />
      <circle cx="150" cy="-11" r="9" />
      <rect className={styles.robotEar} x="16" y="84" width="30" height="64" rx="14" />
      <rect className={styles.robotEar} x="254" y="84" width="30" height="64" rx="14" />
      <rect x="36" y="26" width="228" height="206" rx="52" />
    </svg>
  );
}

function FeatureIcon({ icon }) {
  if (icon === 'shield') return <FiShield />;
  if (icon === 'document') return <FiFileText />;
  if (icon === 'chat') return <FiMessageCircle />;
  return null;
}

function RouteAnchor({ anchorKey, kind }) {
  if (!anchorKey) return null;
  return <span id={anchorKey} className={`${styles.routeAnchor} ${styles[`${kind}Anchor`]}`} aria-hidden="true" />;
}

function FeaturePoint({ feature, prefersReducedMotion, isTabletLayout }) {
  return (
    <div id={`journey-${feature.key}`} className={`${styles.featurePosition} ${feature.className}`}>
      <RouteAnchor anchorKey={feature.entryAnchor} kind="entry" />
      <RouteAnchor anchorKey={feature.exitAnchor} kind="exit" />
      <Link className={styles.featureLink} to={feature.to} aria-label={`${feature.label} 바로가기`}>
        <motion.div
          className={`${styles.featureBox} ${styles[`${feature.type}Box`]}`}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16, scale: prefersReducedMotion ? 1 : 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: prefersReducedMotion ? 0.2 : FEATURE_REVEAL_DURATION, delay: prefersReducedMotion ? 0 : (isTabletLayout ? feature.tabletDelay : feature.delay), ease: [0.16, 1, 0.3, 1] }}
        >
          <ShapeOutline type={feature.type} />
          <span className={styles.featureCopy}>
            {feature.icon && (
              <span className={`${styles.featureIcon} ${styles[`${feature.type}FeatureIcon`]}`} aria-hidden="true">
                <FeatureIcon icon={feature.icon} />
              </span>
            )}
            <strong>{feature.label}</strong>
            <small>{feature.description}</small>
          </span>
        </motion.div>
      </Link>
    </div>
  );
}

function CompletePoint({ prefersReducedMotion, isTabletLayout }) {
  const revealDelay = isTabletLayout ? TABLET_COMPLETE_REVEAL_DELAY : COMPLETE_REVEAL_DELAY;

  return (
    <div id="journey-complete" className={`${styles.featurePosition} ${styles.completePoint}`}>
      <RouteAnchor anchorKey="completeEntry" kind="entry" />
      <motion.div
        className={styles.completeBox}
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 14, scale: prefersReducedMotion ? 1 : 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: prefersReducedMotion ? 0.2 : COMPLETE_REVEAL_DURATION, delay: prefersReducedMotion ? 0 : revealDelay, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.span
          className={styles.completeGlow}
          aria-hidden="true"
          animate={{ opacity: prefersReducedMotion ? 0 : [0, 0.34, 0], scale: prefersReducedMotion ? 1 : [0.86, 1.13, 1.28] }}
          transition={{ duration: prefersReducedMotion ? 0.2 : 1.1, delay: prefersReducedMotion ? 0 : revealDelay }}
        />
        <span className={styles.completeIcon} aria-hidden="true"><FiCheck /></span>
        <strong>서류 준비 완료!</strong>
        <small>필요한 보증보험 서류가 모두 준비됐어요.<br />준비한 서류로 보증보험을 신청하면 돼요.</small>
      </motion.div>
    </div>
  );
}

function ResponsiveStartButton({ prefersReducedMotion, isTabletLayout }) {
  const revealDelay = TABLET_COMPLETE_REVEAL_DELAY + COMPLETE_REVEAL_DURATION + START_BUTTON_REVEAL_GAP;

  return (
    <motion.div
      className={styles.responsiveStartButtonWrap}
      initial={{ opacity: isTabletLayout ? 0 : 1, y: isTabletLayout && !prefersReducedMotion ? 12 : 0, scale: isTabletLayout && !prefersReducedMotion ? 0.96 : 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: prefersReducedMotion || !isTabletLayout ? 0.2 : 0.45, delay: prefersReducedMotion || !isTabletLayout ? 0 : revealDelay, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link className={styles.responsiveStartButton} to="/auth/login">HUGME 시작하기</Link>
    </motion.div>
  );
}

function DesktopStartButton({ prefersReducedMotion }) {
  const revealDelay = COMPLETE_REVEAL_DELAY + COMPLETE_REVEAL_DURATION + START_BUTTON_REVEAL_GAP;

  return (
    <div className={styles.desktopStartButtonWrap}>
      <motion.div
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12, scale: prefersReducedMotion ? 1 : 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: prefersReducedMotion ? 0.2 : 0.45, delay: prefersReducedMotion ? 0 : revealDelay, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link className={styles.desktopStartButton} to="/auth/login">HUGME 시작하기</Link>
      </motion.div>
    </div>
  );
}

function MobileFeatureCard({ feature }) {
  return (
    <Link className={`${styles.featureLink} ${styles.mobileFeatureLink}`} to={feature.to} aria-label={`${feature.label} 바로가기`}>
      <div className={`${styles.featureBox} ${styles.mobileFeatureBox} ${styles[`${feature.type}Box`]}`}>
        <ShapeOutline type={feature.type} />
        <span className={styles.featureCopy}>
          {feature.icon && (
            <span className={`${styles.featureIcon} ${styles[`${feature.type}FeatureIcon`]}`} aria-hidden="true">
              <FeatureIcon icon={feature.icon} />
            </span>
          )}
          <strong>{feature.label}</strong>
          <small>{feature.description}</small>
        </span>
      </div>
    </Link>
  );
}

function MobileCompleteCard() {
  return (
    <div className={`${styles.completeBox} ${styles.mobileCompleteBox}`}>
      <span className={styles.completeIcon} aria-hidden="true"><FiCheck /></span>
      <strong>서류 준비 완료!</strong>
      <small>필요한 보증보험 서류가 모두 준비됐어요.<br />준비한 서류로 보증보험을 신청하면 돼요.</small>
    </div>
  );
}

function MobileJourneyItem({ item, prefersReducedMotion }) {
  const itemRef = useRef(null);
  const [isVisible, setIsVisible] = useState(item.initial || prefersReducedMotion);

  useEffect(() => {
    if (isVisible || prefersReducedMotion) return undefined;

    const element = itemRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setIsVisible(true);
      observer.disconnect();
    }, { threshold: 0.01, rootMargin: '0px 0px -15% 0px' });

    observer.observe(element);
    return () => observer.disconnect();
  }, [isVisible, prefersReducedMotion]);

  const feature = item.featureKey ? FEATURES.find(({ key }) => key === item.featureKey) : null;

  return (
    <div
      ref={itemRef}
      className={`${styles.mobileJourneyItem} ${styles[`mobileJourneyItem${item.type[0].toUpperCase()}${item.type.slice(1)}`]} ${item.compact ? styles.mobileJourneyItemCompact : ''} ${item.initial ? styles.mobileJourneyFirstItem : ''} ${isVisible ? styles.mobileJourneyItemVisible : ''}`}
    >
      {!item.initial && <span className={styles.mobileJourneyLine} aria-hidden="true" />}
      <div className={styles.mobileJourneyContent}>
        {item.type === 'feature' && <MobileFeatureCard feature={feature} />}
        {item.type === 'thought' && (
          <p className={`${styles.mobileThoughtBubble} ${item.tone === 'blue' ? styles.mobileThoughtBubbleBlue : ''}`}>
            {item.text}
          </p>
        )}
        {item.type === 'complete' && <MobileCompleteCard />}
      </div>
    </div>
  );
}

function MobileJourney({ prefersReducedMotion }) {
  return (
    <div className={styles.mobileJourney} aria-label="HUGME 모바일 이용 여정">
      {MOBILE_JOURNEY_ITEMS.map((item) => (
        <MobileJourneyItem key={item.key} item={item} prefersReducedMotion={prefersReducedMotion} />
      ))}
    </div>
  );
}

function JourneyBubble({ bubble, canvasRef, prefersReducedMotion, routeRevision }) {
  const pointRef = useRef(null);
  const routeProgressRef = useRef({ desktop: null, tablet: bubble.tabletProgress });
  const [routeSync, setRouteSync] = useState(prefersReducedMotion ? { delay: 0 } : null);
  const isRouteReady = prefersReducedMotion || routeSync?.left !== undefined;

  useLayoutEffect(() => {
    if (prefersReducedMotion) {
      setRouteSync({ delay: 0 });
      return undefined;
    }

    const connection = CONNECTIONS[bubble.connectionIndex];
    const routeKey = getRouteKey(connection);
    let retryId = 0;
    let cancelled = false;

    const syncWithRoute = () => {
      if (cancelled) return;

      const canvas = canvasRef.current;
      const point = pointRef.current;
      const path = document.querySelector(`path[data-journey-route="${routeKey}"]`);

      // 모바일에서는 생각 노드를 숨긴다. display:none 상태의 0 좌표가
      // 다른 반응형 구간의 인라인 위치로 남지 않도록 측정도 중단한다.
      if (window.matchMedia('(max-width: 767px)').matches) {
        setRouteSync((previous) => (previous?.left === undefined ? previous : { delay: previous.delay }));
        return;
      }

      if (!canvas || !point || !path || typeof path.getTotalLength !== 'function') {
        retryId = window.setTimeout(syncWithRoute, 50);
        return;
      }

      const totalLength = path.getTotalLength();
      const matrix = path.getScreenCTM();
      const svg = path.ownerSVGElement;
      if (!totalLength || !matrix || !svg) {
        retryId = window.setTimeout(syncWithRoute, 50);
        return;
      }

      const canvasRect = canvas.getBoundingClientRect();
      const svgPoint = svg.createSVGPoint();
      const layoutKey = window.matchMedia(TABLET_JOURNEY_QUERY).matches ? 'tablet' : 'desktop';
      const routeDuration = layoutKey === 'tablet' ? connection.tabletDuration : connection.duration;
      let progress = routeProgressRef.current[layoutKey];

      // 최초 데스크탑 렌더에서만 CSS로 지정한 디자인 위치와 가장 가까운
      // 선의 진행률을 구한다. 이후에는 이전 픽셀 좌표가 아니라 이 진행률을
      // 사용하므로 화면 크기를 반복해서 바꿔도 위치가 누적되어 틀어지지 않는다.
      if (progress === null) {
        const target = {
          x: canvasRect.left + point.offsetLeft + point.offsetWidth / 2,
          y: canvasRect.top + point.offsetTop + point.offsetHeight / 2,
        };
        let closest = null;
        const sampleCount = 360;

        for (let index = 0; index <= sampleCount; index += 1) {
          const candidateProgress = index / sampleCount;
          const routePoint = path.getPointAtLength(totalLength * candidateProgress);
          svgPoint.x = routePoint.x;
          svgPoint.y = routePoint.y;
          const screenPoint = svgPoint.matrixTransform(matrix);
          const distance = Math.hypot(screenPoint.x - target.x, screenPoint.y - target.y);

          if (!closest || distance < closest.distance) {
            closest = { progress: candidateProgress, distance };
          }
        }

        if (!closest) return;
        progress = closest.progress;
        routeProgressRef.current[layoutKey] = progress;
      }

      const routePoint = path.getPointAtLength(totalLength * progress);
      svgPoint.x = routePoint.x;
      svgPoint.y = routePoint.y;
      const screenPoint = svgPoint.matrixTransform(matrix);

      setRouteSync((previous) => ({
        left: screenPoint.x - canvasRect.left,
        top: screenPoint.y - canvasRect.top,
        delay: previous?.delay ?? Math.max(0, routeDuration * progress - 0.08),
      }));
    };

    syncWithRoute();

    return () => {
      cancelled = true;
      window.clearTimeout(retryId);
    };
  }, [bubble.connectionIndex, canvasRef, prefersReducedMotion, routeRevision]);

  return (
    <motion.div
      ref={pointRef}
      className={`${styles.journeyBubblePoint} ${bubble.className}`}
      style={routeSync?.left === undefined ? undefined : { left: routeSync.left, top: routeSync.top }}
      initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.96 }}
      animate={{ opacity: isRouteReady ? 1 : 0, scale: isRouteReady ? 1 : 0.96 }}
      transition={{ duration: prefersReducedMotion ? 0.2 : 0.32, delay: routeSync?.delay ?? 0, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className={styles.journeyBubbleConnector} aria-hidden="true" />
      <span className={styles.journeyBubbleNode} aria-hidden="true" />
      <p className={styles.journeyBubble}>{bubble.text}</p>
    </motion.div>
  );
}

function JourneyConnections({ canvasRef, prefersReducedMotion, onRoutesUpdated, isTabletLayout }) {
  const updateXarrow = useXarrow();
  const updateXarrowRef = useRef(updateXarrow);
  const [visibleCount, setVisibleCount] = useState(prefersReducedMotion ? CONNECTIONS.length : 0);
  const [readyCount, setReadyCount] = useState(prefersReducedMotion ? CONNECTIONS.length : 0);
  const startedAtRef = useRef(performance.now());
  updateXarrowRef.current = updateXarrow;

  useEffect(() => {
    if (prefersReducedMotion) {
      setVisibleCount(CONNECTIONS.length);
      return undefined;
    }

    const elapsed = (performance.now() - startedAtRef.current) / 1000;
    const getDelay = (connection) => (isTabletLayout ? connection.tabletDelay : connection.delay);
    const elapsedVisibleCount = CONNECTIONS.filter((connection) => getDelay(connection) <= elapsed).length;
    setVisibleCount((currentCount) => Math.max(currentCount, elapsedVisibleCount));
    const timerIds = CONNECTIONS
      .map((connection, index) => ({ delay: getDelay(connection), index }))
      .filter(({ delay }) => delay > elapsed)
      .map(({ delay, index }) => window.setTimeout(() => {
        setVisibleCount((currentCount) => Math.max(currentCount, index + 1));
      }, (delay - elapsed) * 1000));
    return () => timerIds.forEach((timerId) => window.clearTimeout(timerId));
  }, [isTabletLayout, prefersReducedMotion]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let frameId = 0;
    let settleFrameId = 0;
    let notifyFrameId = 0;
    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frameId);
      window.cancelAnimationFrame(settleFrameId);
      window.cancelAnimationFrame(notifyFrameId);
      frameId = window.requestAnimationFrame(() => {
        updateXarrowRef.current();
        // react-xarrows가 새 SVG 경로를 DOM에 반영한 다음 프레임에
        // 노드와 말풍선 좌표를 같은 경로 기준으로 다시 계산한다.
        // 새 선은 이 측정이 끝날 때까지 투명하게 유지해 초기 좌표가
        // 한 프레임 노출되는 깜빡임을 방지한다.
        settleFrameId = window.requestAnimationFrame(() => {
          notifyFrameId = window.requestAnimationFrame(() => {
            onRoutesUpdated();
            setReadyCount((currentCount) => Math.max(currentCount, visibleCount));
          });
        });
      });
    };

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(canvas);
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('orientationchange', scheduleUpdate);
    document.fonts?.ready.then(scheduleUpdate).catch(() => {});
    scheduleUpdate();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.cancelAnimationFrame(settleFrameId);
      window.cancelAnimationFrame(notifyFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('orientationchange', scheduleUpdate);
    };
  }, [canvasRef, isTabletLayout, onRoutesUpdated, visibleCount]);

  return CONNECTIONS.slice(0, visibleCount).map((connection, index) => (
    <Xarrow
      key={`${connection.start}-${connection.end}`}
      start={connection.start}
      end={connection.end}
      startAnchor={isTabletLayout ? 'middle' : connection.startAnchor}
      endAnchor={isTabletLayout ? 'middle' : connection.endAnchor}
      path={isTabletLayout ? 'straight' : 'smooth'}
      curveness={connection.curveness}
      color="#3d86b9"
      strokeWidth={3.5}
      showHead={false}
      animateDrawing={prefersReducedMotion ? false : (isTabletLayout ? connection.tabletDuration : connection.duration)}
      zIndex={2}
      arrowBodyProps={{ strokeLinecap: 'round', strokeLinejoin: 'round', 'data-journey-route': getRouteKey(connection) }}
      divContainerStyle={{ pointerEvents: 'none', opacity: index < readyCount ? 1 : 0 }}
      SVGcanvasStyle={{ maxWidth: 'none', overflow: 'visible' }}
    />
  ));
}

export default function LandingPage() {
  const [showJourney, setShowJourney] = useState(false);
  const [routeRevision, setRouteRevision] = useState(0);
  const canvasRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const handleRoutesUpdated = useRef(() => setRouteRevision((revision) => revision + 1)).current;
  const [isTabletLayout, setIsTabletLayout] = useState(() => window.matchMedia(TABLET_JOURNEY_QUERY).matches);

  useEffect(() => {
    const timerId = window.setTimeout(() => setShowJourney(true), INTRO_DURATION_MS);
    return () => window.clearTimeout(timerId);
  }, []);

  useEffect(() => {
    const tabletMedia = window.matchMedia(TABLET_JOURNEY_QUERY);
    const handleLayoutChange = (event) => setIsTabletLayout(event.matches);
    tabletMedia.addEventListener('change', handleLayoutChange);
    return () => tabletMedia.removeEventListener('change', handleLayoutChange);
  }, []);

  useEffect(() => {
    if (!showJourney) return undefined;

    const tabletMedia = window.matchMedia(TABLET_JOURNEY_QUERY);
    const journeyStartedAt = performance.now();
    let frameId = 0;
    let activeRouteIndex = -1;
    let routeStartScroll = window.scrollY;
    const completedRoutes = new Set();
    const scrollRoutes = [
      { start: TABLET_RISK_ROUTE_DELAY, end: TABLET_RISK_ROUTE_DELAY + TABLET_ROUTE_DRAW_DURATION, id: 'journey-checklist' },
      { start: TABLET_CHECKLIST_ROUTE_DELAY, end: TABLET_CHECKLIST_ROUTE_DELAY + TABLET_ROUTE_DRAW_DURATION, id: 'journey-preparation-guide' },
      { start: TABLET_PREPARATION_ROUTE_DELAY, end: TABLET_PREPARATION_ROUTE_DELAY + TABLET_ROUTE_DRAW_DURATION, id: 'journey-complete' },
    ];

    const getTargetScroll = (id) => {
      const element = document.getElementById(id);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      const absoluteTop = window.scrollY + rect.top;
      return Math.max(0, absoluteTop + rect.height / 2 - window.innerHeight / 2);
    };

    const followRoute = () => {
      const elapsed = (performance.now() - journeyStartedAt) / 1000;
      if (tabletMedia.matches && !prefersReducedMotion) {
        scrollRoutes.forEach((route, index) => {
          if (elapsed >= route.end && !completedRoutes.has(index)) {
            const targetScroll = getTargetScroll(route.id);
            if (targetScroll !== null) window.scrollTo(0, targetScroll);
            completedRoutes.add(index);
          }
        });

        const routeIndex = scrollRoutes.findIndex((route) => elapsed >= route.start && elapsed < route.end);
        if (routeIndex >= 0) {
          const route = scrollRoutes[routeIndex];
          if (activeRouteIndex !== routeIndex) {
            activeRouteIndex = routeIndex;
            routeStartScroll = window.scrollY;
          }
          const targetScroll = getTargetScroll(route.id);
          if (targetScroll !== null) {
            const progress = (elapsed - route.start) / (route.end - route.start);
            const easedProgress = progress * progress * (3 - 2 * progress);
            window.scrollTo(0, routeStartScroll + (targetScroll - routeStartScroll) * easedProgress);
          }
        } else {
          activeRouteIndex = -1;
        }
      }

      if (elapsed <= TABLET_COMPLETE_REVEAL_DELAY + 1) {
        frameId = window.requestAnimationFrame(followRoute);
      }
    };

    frameId = window.requestAnimationFrame(followRoute);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [prefersReducedMotion, showJourney]);

  return (
    <main className={styles.root}>
      <header className={styles.topbar}>
        <Link to="/" className={styles.logoLink} aria-label="HUGME 홈"><img className={styles.logo} src="/images/Logo.png" alt="HUGME" /></Link>
        <nav className={styles.authLinks} aria-label="인증">
          <Link className={styles.loginLink} to="/auth/login">로그인</Link>
          <Link className={styles.signupLink} to="/auth/signup">회원가입</Link>
        </nav>
      </header>

      <AnimatePresence mode="sync">
        {!showJourney ? (
          <motion.div key="landing-intro" className={styles.sceneLayer} initial={{ x: 0, opacity: 1 }} animate={{ x: 0, opacity: 1 }} exit={{ x: prefersReducedMotion ? 0 : '-105%', opacity: prefersReducedMotion ? 0 : 1 }} transition={{ duration: prefersReducedMotion ? 0.2 : 1.05, ease: SCENE_EASE }}>
            <LandingIntro />
          </motion.div>
        ) : (
          <motion.section key="landing-journey" className={styles.journey} aria-labelledby="landing-title" initial={{ x: prefersReducedMotion ? 0 : '105%', opacity: prefersReducedMotion ? 0 : 1 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: prefersReducedMotion ? 0.2 : 1.05, ease: SCENE_EASE }}>
            <div className={styles.titleGroup}>
              <p className={styles.eyebrow}>나의 안전한 전세 여정</p>
              <h1 id="landing-title">전세위험진단부터 보증보험 서류 준비까지</h1>
              <DesktopStartButton prefersReducedMotion={prefersReducedMotion} />
            </div>
            <Xwrapper>
              <div ref={canvasRef} className={styles.journeyCanvas}>
                <JourneyConnections canvasRef={canvasRef} prefersReducedMotion={prefersReducedMotion} onRoutesUpdated={handleRoutesUpdated} isTabletLayout={isTabletLayout} />
                {FEATURES.map((feature) => <FeaturePoint key={feature.key} feature={feature} prefersReducedMotion={prefersReducedMotion} isTabletLayout={isTabletLayout} />)}
                {JOURNEY_BUBBLES.map((bubble) => <JourneyBubble key={bubble.key} bubble={bubble} canvasRef={canvasRef} prefersReducedMotion={prefersReducedMotion} routeRevision={routeRevision} />)}
                <CompletePoint prefersReducedMotion={prefersReducedMotion} isTabletLayout={isTabletLayout} />
              </div>
            </Xwrapper>
            <MobileJourney prefersReducedMotion={prefersReducedMotion} />
            <ResponsiveStartButton prefersReducedMotion={prefersReducedMotion} isTabletLayout={isTabletLayout} />
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
