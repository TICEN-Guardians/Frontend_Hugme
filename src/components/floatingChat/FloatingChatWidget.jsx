import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import FloatingIcon from './FloatingIcon/FloatingIcon.jsx';
import FloatingChatStage1 from './FloatingChatStage1/FloatingChatStage1.jsx';
import useGuideChat from '../../hooks/useGuideChat.js';

const STAGE = {
  CLOSED: 'CLOSED',
  STAGE_1: 'STAGE_1',
};

// 조건상담 챗봇을 모든 페이지에서 접근 가능하게 하는 플로팅 위젯.
// "2단계"는 별도 패널이 아니라 /user-chat 전체 화면 페이지 그 자체다 — 1단계에서 확장을
// 누르면 실제로 그 페이지로 이동한다(그래서 /user-chat에서는 위젯 자체를 띄우지 않는다).
// 세션/대화 상태(useGuideChat)는 여기서 한 번만 만들어서, 위젯을 닫았다 다시 열어도
// 같은 방문 동안은 대화가 유지된다.
export default function FloatingChatWidget() {
  const location = useLocation();
  const navigate = useNavigate();
  const [stage, setStage] = useState(STAGE.CLOSED);
  const chat = useGuideChat();

  if (location.pathname === '/user-chat') {
    return null;
  }

  const handleExpand = () => {
    setStage(STAGE.CLOSED);
    navigate('/user-chat');
  };

  return (
    <AnimatePresence>
      {stage === STAGE.CLOSED && <FloatingIcon key="icon" onOpen={() => setStage(STAGE.STAGE_1)} />}
      {stage === STAGE.STAGE_1 && (
        <FloatingChatStage1
          key="stage1"
          chat={chat}
          onClose={() => setStage(STAGE.CLOSED)}
          onExpand={handleExpand}
        />
      )}
    </AnimatePresence>
  );
}
