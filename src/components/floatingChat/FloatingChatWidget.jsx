import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGuideChatContext } from '../../context/guideChat/GuideChatContext.jsx';
import FloatingChatStage1 from './FloatingChatStage1/FloatingChatStage1.jsx';
import FloatingIcon from './FloatingIcon/FloatingIcon.jsx';

const STAGE = { CLOSED: 'CLOSED', STAGE_1: 'STAGE_1' };
const VIEWPORT_GAP = 12;
const WIDGET_GAP = 12;
const DEFAULT_ICON_SIZE = 88;
const DEFAULT_PANEL_SIZE = { width: 380, height: 580 };
const OPPOSITE_SIDE = { left: 'right', right: 'left', above: 'below', below: 'above' };
const POSITION_EASE = [0.16, 1, 0.3, 1];

const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max));
const getViewport = () => ({ width: window.innerWidth, height: window.innerHeight });

function clampRectPosition(position, size, viewport) {
  return {
    x: clamp(position.x, VIEWPORT_GAP, viewport.width - size.width - VIEWPORT_GAP),
    y: clamp(position.y, VIEWPORT_GAP, viewport.height - size.height - VIEWPORT_GAP),
  };
}

function placeCompanion(anchor, companionSize, preferredSide, viewport, crossOffset = null) {
  const spaces = {
    left: anchor.x - VIEWPORT_GAP,
    right: viewport.width - anchor.x - anchor.width - VIEWPORT_GAP,
    above: anchor.y - VIEWPORT_GAP,
    below: viewport.height - anchor.y - anchor.height - VIEWPORT_GAP,
  };
  const needed = (side) => (
    (side === 'left' || side === 'right' ? companionSize.width : companionSize.height) + WIDGET_GAP
  );
  const sides = [...new Set([preferredSide, OPPOSITE_SIDE[preferredSide], 'left', 'right', 'above', 'below'])];
  const side = sides.find((candidate) => spaces[candidate] >= needed(candidate))
    ?? sides.reduce((best, candidate) => (
      spaces[candidate] - needed(candidate) > spaces[best] - needed(best) ? candidate : best
    ));

  let position;
  if (side === 'left') {
    position = { x: anchor.x - companionSize.width - WIDGET_GAP, y: anchor.y + (crossOffset?.y ?? (anchor.height - companionSize.height) / 2) };
  } else if (side === 'right') {
    position = { x: anchor.x + anchor.width + WIDGET_GAP, y: anchor.y + (crossOffset?.y ?? (anchor.height - companionSize.height) / 2) };
  } else if (side === 'above') {
    position = { x: anchor.x + (crossOffset?.x ?? (anchor.width - companionSize.width) / 2), y: anchor.y - companionSize.height - WIDGET_GAP };
  } else {
    position = { x: anchor.x + (crossOffset?.x ?? (anchor.width - companionSize.width) / 2), y: anchor.y + anchor.height + WIDGET_GAP };
  }

  return { side, position: clampRectPosition(position, companionSize, viewport) };
}

function isRectInsideViewport(position, size, viewport) {
  return position.x >= VIEWPORT_GAP
    && position.y >= VIEWPORT_GAP
    && position.x + size.width <= viewport.width - VIEWPORT_GAP
    && position.y + size.height <= viewport.height - VIEWPORT_GAP;
}

function getInitialIconPosition() {
  const viewport = getViewport();
  return { x: viewport.width - DEFAULT_ICON_SIZE - 24, y: viewport.height - DEFAULT_ICON_SIZE - 24 };
}

// 사용자가 잡은 요소는 포인터를 따라가고, 짝이 되는 요소는 화면 경계에 따라
// 상하좌우 중 안전한 위치로 자동 전환된다.
export default function FloatingChatWidget() {
  const location = useLocation();
  const navigate = useNavigate();
  const [stage, setStage] = useState(STAGE.CLOSED);
  const [iconPosition, setIconPosition] = useState(getInitialIconPosition);
  const [panelPosition, setPanelPosition] = useState({ x: VIEWPORT_GAP, y: VIEWPORT_GAP });
  const [iconSize, setIconSize] = useState({ width: DEFAULT_ICON_SIZE, height: DEFAULT_ICON_SIZE });
  const [panelSize, setPanelSize] = useState(DEFAULT_PANEL_SIZE);
  const [flippingElement, setFlippingElement] = useState(null);
  const iconRef = useRef(null);
  const panelRef = useRef(null);
  const iconPositionRef = useRef(iconPosition);
  const iconSizeRef = useRef(iconSize);
  const dragRef = useRef(null);
  const flipTimerRef = useRef(null);
  const suppressOpenRef = useRef(false);
  const placementRef = useRef({ panelFromIcon: 'left', iconFromPanel: 'right' });
  const chat = useGuideChatContext();
  const prefersReducedMotion = useReducedMotion();
  const isExpandedPage = location.pathname === '/user-chat';
  iconPositionRef.current = iconPosition;
  iconSizeRef.current = iconSize;

  const placePanelFromIcon = (nextIconPosition, nextIconSize = iconSize, nextPanelSize = panelSize) => {
    const result = placeCompanion(
      { ...nextIconPosition, ...nextIconSize }, nextPanelSize,
      placementRef.current.panelFromIcon, getViewport(),
    );
    placementRef.current = { panelFromIcon: result.side, iconFromPanel: OPPOSITE_SIDE[result.side] };
    setPanelPosition(result.position);
  };

  const handleOpen = () => {
    chat.resetToNewSession();
    placePanelFromIcon(iconPosition);
    setStage(STAGE.STAGE_1);
  };

  const handleIconClick = () => {
    if (suppressOpenRef.current) {
      suppressOpenRef.current = false;
      return;
    }
    if (stage === STAGE.CLOSED) handleOpen();
    else setStage(STAGE.CLOSED);
  };

  const handleExpand = () => {
    setStage(STAGE.CLOSED);
    navigate('/user-chat');
  };

  const markCompanionFlip = (element) => {
    window.clearTimeout(flipTimerRef.current);
    setFlippingElement(element);
    flipTimerRef.current = window.setTimeout(() => setFlippingElement(null), 240);
  };

  const beginDrag = (kind) => (event) => {
    if (event.button !== 0 || (kind === 'panel' && event.target.closest('button'))) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      kind,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      iconStart: iconPosition,
      panelStart: panelPosition,
      panelFromIcon: placementRef.current.panelFromIcon,
      iconFromPanel: placementRef.current.iconFromPanel,
      moved: false,
    };
  };

  const continueDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.hypot(deltaX, deltaY) > 5) drag.moved = true;
    const viewport = getViewport();

    if (drag.kind === 'icon') {
      const nextIcon = clampRectPosition(
        { x: drag.iconStart.x + deltaX, y: drag.iconStart.y + deltaY }, iconSize, viewport,
      );
      setIconPosition(nextIcon);
      if (stage === STAGE.STAGE_1) {
        const appliedDelta = { x: nextIcon.x - drag.iconStart.x, y: nextIcon.y - drag.iconStart.y };
        const nextPanel = {
          x: drag.panelStart.x + appliedDelta.x,
          y: drag.panelStart.y + appliedDelta.y,
        };

        if (isRectInsideViewport(nextPanel, panelSize, viewport)) {
          setPanelPosition(nextPanel);
        } else {
          const panelPlacement = placeCompanion(
            { ...nextIcon, ...iconSize },
            panelSize,
            OPPOSITE_SIDE[drag.panelFromIcon],
            viewport,
            {
              x: drag.panelStart.x - drag.iconStart.x,
              y: drag.panelStart.y - drag.iconStart.y,
            },
          );
          placementRef.current = {
            panelFromIcon: panelPlacement.side,
            iconFromPanel: OPPOSITE_SIDE[panelPlacement.side],
          };
          setPanelPosition(panelPlacement.position);
          markCompanionFlip('panel');
          dragRef.current = {
            ...drag,
            startX: event.clientX,
            startY: event.clientY,
            iconStart: nextIcon,
            panelStart: panelPlacement.position,
            panelFromIcon: panelPlacement.side,
            iconFromPanel: OPPOSITE_SIDE[panelPlacement.side],
          };
        }
      }
      return;
    }

    const nextPanel = clampRectPosition(
      { x: drag.panelStart.x + deltaX, y: drag.panelStart.y + deltaY }, panelSize, viewport,
    );
    setPanelPosition(nextPanel);
    const appliedDelta = { x: nextPanel.x - drag.panelStart.x, y: nextPanel.y - drag.panelStart.y };
    const nextIcon = {
      x: drag.iconStart.x + appliedDelta.x,
      y: drag.iconStart.y + appliedDelta.y,
    };

    if (isRectInsideViewport(nextIcon, iconSize, viewport)) {
      setIconPosition(nextIcon);
    } else {
      const iconPlacement = placeCompanion(
        { ...nextPanel, ...panelSize },
        iconSize,
        OPPOSITE_SIDE[drag.iconFromPanel],
        viewport,
        {
          x: drag.iconStart.x - drag.panelStart.x,
          y: drag.iconStart.y - drag.panelStart.y,
        },
      );
      placementRef.current = {
        iconFromPanel: iconPlacement.side,
        panelFromIcon: OPPOSITE_SIDE[iconPlacement.side],
      };
      setIconPosition(iconPlacement.position);
      markCompanionFlip('icon');
      dragRef.current = {
        ...drag,
        startX: event.clientX,
        startY: event.clientY,
        iconStart: iconPlacement.position,
        panelStart: nextPanel,
        iconFromPanel: iconPlacement.side,
        panelFromIcon: OPPOSITE_SIDE[iconPlacement.side],
      };
    }
  };

  const endDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.kind === 'icon' && drag.moved) {
      suppressOpenRef.current = true;
      window.setTimeout(() => { suppressOpenRef.current = false; }, 0);
    }
    dragRef.current = null;
  };

  const makeDragHandlers = (kind) => ({
    onPointerDown: beginDrag(kind),
    onPointerMove: continueDrag,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  });

  useLayoutEffect(() => {
    const element = iconRef.current;
    if (!element) return undefined;
    const update = () => {
      setIconSize({ width: element.offsetWidth, height: element.offsetHeight });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const element = panelRef.current;
    if (!element || stage !== STAGE.STAGE_1) return undefined;
    const update = () => {
      const nextSize = { width: element.offsetWidth, height: element.offsetHeight };
      setPanelSize(nextSize);
      placePanelFromIcon(iconPositionRef.current, iconSizeRef.current, nextSize);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [stage]);

  useEffect(() => {
    const handleResize = () => {
      const nextIcon = clampRectPosition(iconPosition, iconSize, getViewport());
      setIconPosition(nextIcon);
      if (stage === STAGE.STAGE_1) placePanelFromIcon(nextIcon);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [iconPosition, iconSize, panelSize, stage]);

  useEffect(() => {
    if (isExpandedPage) setStage(STAGE.CLOSED);
  }, [isExpandedPage]);

  useEffect(() => () => window.clearTimeout(flipTimerRef.current), []);

  if (isExpandedPage) return null;

  return (
    <>
      <motion.div
        style={{
          position: 'fixed',
          zIndex: 1201,
        }}
        initial={false}
        animate={{
          left: iconPosition.x,
          top: iconPosition.y,
          opacity: 1,
          scale: 1,
        }}
        transition={{
          opacity: { duration: prefersReducedMotion ? 0.1 : 0.28, ease: 'easeOut' },
          scale: { duration: prefersReducedMotion ? 0.1 : 0.28, ease: 'easeOut' },
          left: { duration: flippingElement === 'icon' && !prefersReducedMotion ? 0.24 : 0, ease: POSITION_EASE },
          top: { duration: flippingElement === 'icon' && !prefersReducedMotion ? 0.24 : 0, ease: POSITION_EASE },
        }}
      >
        <FloatingIcon
          onOpen={handleIconClick}
          showTooltip={stage === STAGE.CLOSED}
          ariaLabel={stage === STAGE.CLOSED ? '상담 챗봇 열기' : '상담 챗봇 닫기'}
          mode="docked"
          buttonRef={iconRef}
          dragHandlers={makeDragHandlers('icon')}
        />
      </motion.div>

      <AnimatePresence>
        {stage === STAGE.STAGE_1 && (
          <FloatingChatStage1
            key="stage1"
            mode="docked"
            style={{ left: panelPosition.x, top: panelPosition.y, right: 'auto', bottom: 'auto' }}
            chat={chat}
            onClose={() => setStage(STAGE.CLOSED)}
            onExpand={handleExpand}
            panelRef={panelRef}
            dragHandlers={makeDragHandlers('panel')}
            isPositionFlipping={flippingElement === 'panel'}
          />
        )}
      </AnimatePresence>
    </>
  );
}
