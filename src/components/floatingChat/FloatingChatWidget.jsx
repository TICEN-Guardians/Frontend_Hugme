import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGuideChatContext } from '../../context/guideChat/GuideChatContext.jsx';
import { FLOATING_CHAT_COLLAPSE_EVENT } from './floatingChatEvents.js';
import FloatingChatStage1 from './FloatingChatStage1/FloatingChatStage1.jsx';
import FloatingIcon from './FloatingIcon/FloatingIcon.jsx';

const STAGE = { CLOSED: 'CLOSED', STAGE_1: 'STAGE_1' };
const VIEWPORT_GAP = 12;
const WIDGET_GAP = 12;
const DEFAULT_ICON_SIZE = 88;
const DEFAULT_PANEL_SIZE = { width: 380, height: 580 };

const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max));
const getViewport = () => ({ width: window.innerWidth, height: window.innerHeight });

function getInitialIconPosition() {
  const viewport = getViewport();
  return { x: viewport.width - DEFAULT_ICON_SIZE - 24, y: viewport.height - DEFAULT_ICON_SIZE - 24 };
}

// 패널은 항상 아이콘 기준 왼쪽, 아래쪽 라인이 서로 맞도록(하단 정렬) 고정된 오프셋에
// 위치한다 — 아이콘과 패널이 하나의 고정된 짝으로 함께 움직이므로 둘 사이 상대 위치가
// 절대 바뀌지 않고, 따라서 서로 겹칠 일도 없다(예전에는 화면 경계에 부딪히면 상하좌우로
// 옆면을 바꿔가며 재배치했는데, 그 과정에서 여유 공간이 부족하면 겹치는 문제가 있었다).
function derivePanelPosition(iconPosition, iconSize, panelSize) {
  return {
    x: iconPosition.x - panelSize.width - WIDGET_GAP,
    y: iconPosition.y + iconSize.height - panelSize.height,
  };
}

// 아이콘이 움직일 수 있는 범위. 패널이 열려있을 때는 "아이콘 기준 왼쪽·하단 정렬"이라는
// 고정 오프셋을 적용했을 때 패널까지 함께 화면 안에 들어오도록 범위를 더 좁힌다.
function getIconBounds(iconSize, panelSize, viewport, panelOpen) {
  const maxX = viewport.width - iconSize.width - VIEWPORT_GAP;
  const maxY = viewport.height - iconSize.height - VIEWPORT_GAP;
  let minX = VIEWPORT_GAP;
  let minY = VIEWPORT_GAP;

  if (panelOpen) {
    minX = VIEWPORT_GAP + panelSize.width + WIDGET_GAP;
    // panel.y = icon.y + iconH - panelH >= VIEWPORT_GAP 를 icon.y에 대해 정리
    minY = VIEWPORT_GAP + panelSize.height - iconSize.height;
  }

  return { minX, maxX, minY, maxY };
}

function clampIconPosition(position, bounds) {
  return {
    x: clamp(position.x, bounds.minX, bounds.maxX),
    y: clamp(position.y, bounds.minY, bounds.maxY),
  };
}

// 사용자가 잡은 요소(아이콘 또는 패널 헤더)는 포인터를 따라가고, 짝이 되는 요소는 고정된
// 오프셋을 유지한 채 함께 이동한다.
export default function FloatingChatWidget() {
  const location = useLocation();
  const navigate = useNavigate();
  const [stage, setStage] = useState(STAGE.CLOSED);
  const [iconPosition, setIconPosition] = useState(getInitialIconPosition);
  const [iconSize, setIconSize] = useState({ width: DEFAULT_ICON_SIZE, height: DEFAULT_ICON_SIZE });
  const [panelSize, setPanelSize] = useState(DEFAULT_PANEL_SIZE);
  const iconRef = useRef(null);
  const panelRef = useRef(null);
  const dragRef = useRef(null);
  const suppressOpenRef = useRef(false);
  const chat = useGuideChatContext();
  const prefersReducedMotion = useReducedMotion();
  const isExpandedPage = location.pathname === '/user-chat';
  const panelPosition = derivePanelPosition(iconPosition, iconSize, panelSize);

  const handleOpen = () => {
    chat.resetToNewSession();
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

  const beginDrag = (kind) => (event) => {
    if (event.button !== 0 || (kind === 'panel' && event.target.closest('button'))) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      iconStart: iconPosition,
      moved: false,
    };
  };

  const continueDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.hypot(deltaX, deltaY) > 5) drag.moved = true;

    const bounds = getIconBounds(iconSize, panelSize, getViewport(), stage === STAGE.STAGE_1);
    const nextIcon = clampIconPosition(
      { x: drag.iconStart.x + deltaX, y: drag.iconStart.y + deltaY },
      bounds,
    );
    setIconPosition(nextIcon);
  };

  const endDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.moved) {
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
    // isExpandedPage가 바뀔 때마다 재실행: /user-chat에 들어가면 아이콘이 통째로
    // 언마운트됐다가 나올 때 다시 마운트되므로, 그때마다 새 DOM 노드에 다시 붙어야
    // iconSize가 정확하게 유지된다(예전엔 마운트 시 한 번만 붙어서, 재등장한 새
    // 아이콘은 관찰되지 않고 크기 값이 stale하게 남아있는 버그가 있었다).
  }, [isExpandedPage]);

  useLayoutEffect(() => {
    const element = panelRef.current;
    if (!element || stage !== STAGE.STAGE_1) return undefined;
    const update = () => {
      setPanelSize({ width: element.offsetWidth, height: element.offsetHeight });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [stage]);

  // 아이콘/패널 크기가 바뀌거나(리사이즈 관찰), 패널이 열리고 닫히거나, 창 크기가 바뀔 때마다
  // 현재 아이콘 위치가 여전히 유효한 범위 안에 있는지 다시 확인해서 필요하면 안쪽으로 당긴다.
  useEffect(() => {
    const reclamp = () => {
      const bounds = getIconBounds(iconSize, panelSize, getViewport(), stage === STAGE.STAGE_1);
      setIconPosition((prev) => clampIconPosition(prev, bounds));
    };
    reclamp();
    window.addEventListener('resize', reclamp);
    return () => window.removeEventListener('resize', reclamp);
  }, [iconSize, panelSize, stage]);

  useEffect(() => {
    if (isExpandedPage) setStage(STAGE.CLOSED);
  }, [isExpandedPage]);

  // /user-chat(확장 상태)의 "축소" 버튼에서 쏘는 이벤트를 받아 1단계 패널을 다시 연다.
  useEffect(() => {
    const handleCollapseRequest = () => setStage(STAGE.STAGE_1);
    window.addEventListener(FLOATING_CHAT_COLLAPSE_EVENT, handleCollapseRequest);
    return () => window.removeEventListener(FLOATING_CHAT_COLLAPSE_EVENT, handleCollapseRequest);
  }, []);

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
          left: { duration: 0 },
          top: { duration: 0 },
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
          />
        )}
      </AnimatePresence>
    </>
  );
}
