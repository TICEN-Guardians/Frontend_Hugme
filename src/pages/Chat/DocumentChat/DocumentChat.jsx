import { useState } from 'react';
import { FaArrowRight, FaFileLines, FaLock } from 'react-icons/fa6';
import ChatInput from '../../../components/chat/ChatInput/ChatInput.jsx';
import MessageList from '../../../components/chat/MessageList/MessageList.jsx';
import ChecklistPanel from './ChecklistPanel/ChecklistPanel.jsx';
import styles from './DocumentChat.module.css';

const SECTIONS = [
  { sectionCode: 'BASIC', label: '기본서류' },
  { sectionCode: 'ADDITIONAL', label: '추가서류' },
  { sectionCode: 'DISCOUNT', label: '보증료 할인' },
];

const INITIAL_DOCUMENTS = [
  {
    id: 1,
    sectionCode: 'BASIC',
    title: '전세계약서',
    description: '종류 선택 · 상황에 따라 계약서 종류가 달라요',
    ready: false,
    hasSubtypes: true,
  },
  {
    id: 2,
    sectionCode: 'BASIC',
    title: '전입세대열람내역서',
    description: '정부24·주민센터',
    ready: false,
  },
  {
    id: 3,
    sectionCode: 'BASIC',
    title: '주민등록등본',
    description: '전자증명서 제출 가능',
    ready: true,
  },
  {
    id: 4,
    sectionCode: 'ADDITIONAL',
    title: '전세보증금 완납증명서류',
    description: '거래은행',
    ready: false,
  },
  {
    id: 5,
    sectionCode: 'DISCOUNT',
    title: '한부모가족 증명서',
    description: '행정복지센터 발급',
    ready: false,
  },
];

const CONTRACT_SUBTYPES = [
  '확정일자부 신규 전세계약서',
  '갱신(재계약) 전세계약서',
  '보증금 증액 전세계약서',
  '단독·다중·다가구 전세계약서',
];

export default function DocumentChat() {
  // locked: 서류 준비 전(상담 잠금) / selecting: 계약서 종류 선택 중 / checklist: 체크리스트 패널 활성
  const [mode, setMode] = useState('locked');
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [activeSectionCode, setActiveSectionCode] = useState('BASIC');
  // 상담 중인 서류 하나만 추적한다 (배열 아님) — 다른 서류의 상담을 누르면 이 값만 바뀐다.
  const [activeDocumentId, setActiveDocumentId] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'AI 서류 상담입니다. 준비하신 서류에 대해 궁금한 점을 물어보세요.' },
  ]);

  const handleUnlock = () => {
    // TODO: 실제로는 체크리스트 페이지의 업로드/OCR 완료 여부로 잠금이 풀려야 함.
    // 연동 전이라 데모 확인용으로 로컬 상태만 전환.
    setMode('checklist');
  };

  const handleToggleReady = (id) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, ready: !doc.ready } : doc)),
    );
  };

  const handleConsult = (doc) => {
    setActiveDocumentId(doc.id);
    if (doc.hasSubtypes) {
      setMode('selecting');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `${doc.title}는 상황에 따라 종류가 달라요. 아래에서 선택해주세요.` },
      ]);
      return;
    }
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: `${doc.title}에 대해 알려주세요` },
      {
        role: 'assistant',
        content: `${doc.title}는 ${doc.description}에서 준비하실 수 있어요. 자세한 내용은 체크리스트를 참고해주세요.`,
      },
    ]);
  };

  const handleSelectSubtype = (subtype) => {
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: subtype },
      {
        role: 'assistant',
        content: `${subtype} 기준으로 안내해드릴게요. 계약 후 확정일자를 받으시면 준비가 끝나요.`,
      },
    ]);
    setMode('checklist');
  };

  const handleSend = (text) => {
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text },
      // API 없음 — 고정 문구로만 응답
      { role: 'assistant', content: '아직 데모 화면이라 실제 답변은 준비 중이에요. 곧 연결될 예정입니다.' },
    ]);
  };

  return (
    <div className={styles.root}>
      <div className={styles.chatPane}>
        <div className={styles.messages}>
          <MessageList messages={messages} />
          {mode === 'locked' && (
            <div className={styles.lockBox}>
              <div className={styles.lockIcon}>
                <FaLock aria-hidden="true" />
              </div>
              <p className={styles.lockTitle}>
                서류를 업로드하면
                <br />
                상담이 활성화됩니다
              </p>
              <p className={styles.lockDescription}>먼저 체크리스트에서 서류를 준비해 주세요</p>
            </div>
          )}
        </div>

        {mode === 'selecting' && (
          <div className={styles.subtypeRow}>
            {CONTRACT_SUBTYPES.map((subtype) => (
              <button
                key={subtype}
                type="button"
                className={styles.subtypeButton}
                onClick={() => handleSelectSubtype(subtype)}
              >
                {subtype}
              </button>
            ))}
          </div>
        )}

        <ChatInput
          onSend={handleSend}
          disabled={mode === 'locked'}
          placeholder={
            mode === 'locked' ? '체크리스트 완료 후 상담이 활성화됩니다' : '궁금한 점을 입력하세요'
          }
        />
      </div>

      <div className={styles.sidePane}>
        {mode === 'locked' ? (
          <div className={styles.emptyPanel}>
            <div className={styles.emptyIcon}>
              <FaFileLines aria-hidden="true" />
            </div>
            <p className={styles.emptyTitle}>아직 업로드된 서류가 없어요</p>
            <p className={styles.emptyDescription}>
              체크리스트에서 서류를 업로드하고 OCR 확인을 마치면
              <br />이 화면에서 상담을 이어갈 수 있어요
            </p>
            {/* TODO: 실제로는 체크리스트 완료 여부에 따라 자동으로 잠금 해제되어야 함 */}
            <button type="button" className={styles.emptyCta} onClick={handleUnlock}>
              체크리스트로 이동 <FaArrowRight aria-hidden="true" />
            </button>
          </div>
        ) : (
          <ChecklistPanel
            sections={SECTIONS}
            documents={documents}
            activeSectionCode={activeSectionCode}
            activeDocumentId={activeDocumentId}
            onChangeSection={setActiveSectionCode}
            onToggleReady={handleToggleReady}
            onConsult={handleConsult}
          />
        )}
      </div>
    </div>
  );
}
