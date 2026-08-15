import { useState } from 'react';
import { FaFileLines } from 'react-icons/fa6';
import Button from '../../components/common/Button/Button.jsx';
import Chip from '../../components/common/Chip/Chip.jsx';
import DocumentCard from '../../components/common/DocumentCard/DocumentCard.jsx';
import Modal from '../../components/common/Modal/Modal.jsx';
import StatusBadge from '../../components/common/StatusBadge/StatusBadge.jsx';
import TabBar from '../../components/common/TabBar/TabBar.jsx';
import ChatInput from '../../components/chat/ChatInput/ChatInput.jsx';
import MessageList from '../../components/chat/MessageList/MessageList.jsx';
import styles from './MainPage.module.css';

const TABS = [
  { key: 'all', label: '전체', count: 12 },
  { key: 'pending', label: '대기', count: 3 },
  { key: 'done', label: '완료' },
];

const INITIAL_MESSAGES = [
  { role: 'assistant', content: '안녕하세요, 무엇을 도와드릴까요?' },
  { role: 'user', content: '전세 계약서 서류 안내해주세요.' },
];

function ThemeSection({ theme, label }) {
  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setModalOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);

  const handleSend = (text) => {
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
  };

  return (
    <section className={styles.section} data-theme={theme}>
      <h2 className={styles.sectionTitle}>{label}</h2>

      <div className={styles.block}>
        <h3 className={styles.blockTitle}>Button</h3>
        <div className={styles.row}>
          <Button variant="primary" size="md">
            Primary MD
          </Button>
          <Button variant="primary" size="sm">
            Primary SM
          </Button>
          <Button variant="secondary" size="md">
            Secondary MD
          </Button>
          <Button variant="secondary" size="sm">
            Secondary SM
          </Button>
          <Button variant="primary" size="md" disabled>
            Disabled
          </Button>
        </div>
      </div>

      <div className={styles.block}>
        <h3 className={styles.blockTitle}>Chip / StatusBadge</h3>
        <div className={styles.row}>
          <Chip>카테고리</Chip>
          <StatusBadge label="검토중" tone="neutral" />
          <StatusBadge label="완료" tone="accent" />
        </div>
      </div>

      <div className={styles.block}>
        <h3 className={styles.blockTitle}>TabBar</h3>
        <TabBar tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />
      </div>

      <div className={styles.block}>
        <h3 className={styles.blockTitle}>DocumentCard</h3>
        <div className={styles.cardGrid}>
          <DocumentCard
            icon={<FaFileLines />}
            title="전체 표시"
            description="모든 항목이 채워진 카드입니다."
            chip="임대차계약서"
            status={{ label: '완료', tone: 'accent' }}
            onClick={() => {}}
          />
          <DocumentCard
            icon={<FaFileLines />}
            title="description 없음"
            chip="등기부등본"
            status={{ label: '대기', tone: 'neutral' }}
          />
          <DocumentCard
            icon={<FaFileLines />}
            title="chip·status 없음"
            description="설명만 있는 카드입니다."
          />
          <DocumentCard icon={<FaFileLines />} title="제목만" />
        </div>
      </div>

      <div className={styles.block}>
        <h3 className={styles.blockTitle}>Modal</h3>
        <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)}>
          모달 열기
        </Button>
        <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
          <p>{label} 테마 모달 내용입니다.</p>
        </Modal>
      </div>

      <div className={styles.block}>
        <h3 className={styles.blockTitle}>Chat (MessageList + ChatInput)</h3>
        <div className={styles.chatDemo}>
          <MessageList messages={messages} />
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    </section>
  );
}

export default function MainPage() {
  return (
    <div className={styles.root}>
      <p className={styles.notice}>임시 컴포넌트 갤러리 — 추후 삭제 예정</p>
      <ThemeSection theme="general" label="General" />
      <ThemeSection theme="special" label="Special" />
    </div>
  );
}
