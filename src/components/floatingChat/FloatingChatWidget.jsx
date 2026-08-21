import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useGuideChat from '../../hooks/useGuideChat.js';
import FloatingChatStage1 from './FloatingChatStage1/FloatingChatStage1.jsx';
import FloatingIcon from './FloatingIcon/FloatingIcon.jsx';

const STAGE = {
  CLOSED: 'CLOSED',
  STAGE_1: 'STAGE_1',
};

const DEFAULT_COLLAPSE_PATH = '/';

// 조건상담 챗봇을 모든 페이지에서 접근 가능하게 하는 플로팅 위젯.
// "2단계"는 별도 패널이 아니라 /user-chat 전체 화면 페이지 그 자체다 — 1단계에서 확장을
// 누르면 실제로 그 페이지로 이동한다. /user-chat 위에서는 위젯 패널 대신 아이콘만 다시
// 떠서, 누르면 확장하기 직전 있던 페이지로 돌아간다(확장을 "닫는" 느낌).
//
// 위젯을 열 때마다(닫았다 다시 열기 포함), 그리고 로그인<->로그아웃이 실제로 일어날 때마다
// 항상 새 세션으로 시작한다 — 과거 대화를 이어보고 싶은 로그인 사용자는 2단계(/user-chat)
// 페이지의 세션 목록에서 찾아 들어가면 된다(그 목록 UI는 별도 사이드바 레이아웃에 연결 예정).
export default function FloatingChatWidget({ mode = 'floating' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [stage, setStage] = useState(STAGE.CLOSED);
  const [collapsePath, setCollapsePath] = useState(DEFAULT_COLLAPSE_PATH);
  const chat = useGuideChat();
  const isLandingMode = mode === 'landing';

  const isExpandedPage = location.pathname === '/user-chat';

  const handleOpen = () => {
    chat.resetToNewSession();
    setStage(STAGE.STAGE_1);
  };

  const handleExpand = () => {
    setCollapsePath(location.pathname);
    setStage(STAGE.CLOSED);
    navigate('/user-chat');
  };

  const handleCollapseBack = () => {
    navigate(collapsePath);
  };

  if (isExpandedPage) {
    return (
      <FloatingIcon
        onOpen={handleCollapseBack}
        showTooltip={false}
        ariaLabel="이전 화면으로 돌아가기"
        mode={mode}
      />
    );
  }

  return (
    <AnimatePresence>
      {stage === STAGE.CLOSED && <FloatingIcon key="icon" onOpen={handleOpen} mode={mode} />}
      {stage === STAGE.STAGE_1 && (
        <FloatingChatStage1
          key="stage1"
          mode={isLandingMode ? 'landing' : 'floating'}
          chat={chat}
          onClose={() => setStage(STAGE.CLOSED)}
          onExpand={handleExpand}
        />
      )}
    </AnimatePresence>
  );
}
