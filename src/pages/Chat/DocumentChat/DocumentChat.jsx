import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { FaArrowRight, FaComments, FaFileLines, FaLock } from 'react-icons/fa6';
import ChatInput from '../../../components/chat/ChatInput/ChatInput.jsx';
import MessageList from '../../../components/chat/MessageList/MessageList.jsx';
import { useDocumentPreparation } from '../../../hooks/useDocumentPreparation.js';
import { LAST_DOCUMENT_CHAT_APPLICATION_ID_KEY } from '../../../hooks/useContractUpload.js';
import { sendDocumentMessage } from '../../../api/docChat/docChatService.js';
import ChecklistPanel from './ChecklistPanel/ChecklistPanel.jsx';
import styles from './DocumentChat.module.css';

const DOCUMENT_CHAT_TRANSITION = {
  duration: 1.25,
  ease: [0.16, 1, 0.3, 1],
};

const ENTRY_EASE = [0.16, 1, 0.3, 1];

const entryStateVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.22,
      staggerChildren: 0.11,
    },
  },
};

const entryItemVariants = {
  hidden: (reducedMotion) => ({
    opacity: 0,
    y: reducedMotion ? 0 : 28,
  }),
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: ENTRY_EASE },
  },
};

const entryTitleVariants = {
  hidden: (reducedMotion) => ({
    opacity: 0,
    y: reducedMotion ? 0 : 38,
  }),
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.95, ease: ENTRY_EASE },
  },
};

const entryIconVariants = {
  hidden: (reducedMotion) => ({
    opacity: 0,
    scale: reducedMotion ? 1 : 0.92,
  }),
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.9, ease: ENTRY_EASE },
  },
};

const entrySuggestionListVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const entrySuggestionVariants = {
  hidden: (reducedMotion) => ({
    opacity: 0,
    y: reducedMotion ? 0 : 22,
  }),
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.78, ease: ENTRY_EASE },
  },
};

const DOCUMENT_ENTRY_QUESTIONS = [
  '이 서류는 왜 필요한가요?',
  '이 서류는 어떻게 발급받나요?',
  '인터넷으로 발급할 수 있나요?',
  '방문해서 발급받을 수 있나요?',
  '이 서류 발급하려면 뭘 가져가야 하나요?',
  '발급 비용이 얼마인가요?',
];

function normalizeSectionName(sectionCode, sectionName) {
  if (sectionName) return sectionName;
  if (sectionCode === 'BASIC') return '기본서류';
  if (sectionCode === 'ADDITIONAL') return '추가서류';
  if (sectionCode === 'DISCOUNT') return '보증료 할인';
  return sectionCode;
}

function withUiDocumentFields(document, sectionCode, variantSelections) {
  const documentName = document.documentName ?? document.title ?? '';

  return {
    ...document,
    sectionCode,
    documentName,
    description: document.description ?? '',
    prepared: Boolean(document.prepared),
    selectableVariants: document.selectableVariants,
    selectedVariantId: variantSelections[document.documentId] ?? document.selectedVariantId,
  };
}

export default function DocumentChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const applicationId =
    location.state?.applicationId ??
    sessionStorage.getItem(LAST_DOCUMENT_CHAT_APPLICATION_ID_KEY);
  const [activeSectionCode, setActiveSectionCode] = useState('BASIC');
  const [expandedDocumentId, setExpandedDocumentId] = useState(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [variantSelections, setVariantSelections] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([]);

  const {
    preparation,
    checklistCompleted,
    isLoading,
    isUpdating,
    error,
    changePrepared,
  } = useDocumentPreparation(applicationId);

  const sections = useMemo(
    () =>
      (preparation?.sections ?? []).map((section) => ({
        sectionCode: section.sectionCode,
        label: normalizeSectionName(section.sectionCode, section.sectionName),
        documents: section.documents ?? [],
      })),
    [preparation],
  );

  const documents = useMemo(
    () =>
      sections.flatMap((section) =>
        section.documents.map((document) =>
          withUiDocumentFields(document, section.sectionCode, variantSelections),
        ),
      ),
    [sections, variantSelections],
  );

  const hasPreparation = Boolean(preparation && preparation.totalDocumentCount > 0);
  const isChecklistLoading = checklistCompleted === null;
  const isLocked = checklistCompleted !== true || !hasPreparation;
  const selectedDocument =
    documents.find((document) => document.documentId === selectedDocumentId) ?? null;
  const selectedVariant = selectedDocument?.selectableVariants?.find(
    (variant) => variant.variantId === selectedDocument.selectedVariantId,
  );

  useEffect(() => {
    if (!sections.length) return;
    const hasCurrentSection = sections.some((section) => section.sectionCode === activeSectionCode);
    if (!hasCurrentSection) {
      setActiveSectionCode(sections[0].sectionCode);
    }
  }, [activeSectionCode, sections]);

  const handleTogglePrepared = async (document) => {
    await changePrepared(document.documentId, !document.prepared);
  };

  const handleToggleExpanded = (documentId) => {
    setExpandedDocumentId((prev) => (prev === documentId ? null : documentId));
  };

  const handleSelectDocument = (documentId) => {
    setSelectedDocumentId((prev) => (prev === documentId ? null : documentId));
    setExpandedDocumentId((prev) => (prev === documentId ? prev : null));
  };

  const handleSelectVariant = (documentId, variantId) => {
    setSelectedDocumentId(documentId);
    setVariantSelections((prev) => ({
      ...prev,
      [documentId]: variantId,
    }));
  };

  const handleSend = async (text) => {
    if (!text || isSending || isLocked) return;

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text },
    ]);

    setIsSending(true);

    try {
      const response = await sendDocumentMessage(selectedDocumentId, text);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.answer ?? '답변을 불러왔지만 표시할 내용이 없습니다.',
          sources: response.sources ?? [],
        },
      ]);
    } catch (requestError) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '서류 안내를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
          sources: [],
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.chatPane}>
        <div className={styles.messages}>
          {messages.length > 0 && (
            <motion.div
              className={styles.chatContent}
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : {
                      ...DOCUMENT_CHAT_TRANSITION,
                      delay: 0.12,
                    }
              }
            >
              <MessageList
                messages={messages}
                animateMessages
                showOrderedLists={false}
                documentChatMode
              />
              {isSending && (
                <motion.div
                  className={styles.typingRow}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0.2 : 0.42, ease: [0.16, 1, 0.3, 1] }}
                  aria-live="polite"
                >
                  <div className={styles.typingBubble}>
                    <span className={styles.typingText}>답변을 생각하는 중</span>
                    <span className={styles.typingDots} aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
          {!isLoading && !isChecklistLoading && !isLocked && messages.length === 0 && (
            <motion.div
              className={styles.entryEmpty}
              custom={prefersReducedMotion}
              initial="hidden"
              animate="visible"
              variants={entryStateVariants}
            >
              <motion.div
                className={styles.entryIcon}
                custom={prefersReducedMotion}
                variants={entryIconVariants}
              >
                <FaComments aria-hidden="true" />
              </motion.div>
              <motion.h2
                className={styles.entryTitle}
                custom={prefersReducedMotion}
                variants={entryTitleVariants}
              >
                어떤 서류가 궁금하세요?
              </motion.h2>
              <motion.p
                className={styles.entryDescription}
                custom={prefersReducedMotion}
                variants={entryItemVariants}
              >
                오른쪽 목록에서 궁금한 서류를 먼저 선택해 주세요.
                <br />
                아래 추천 질문을 누르면 선택한 서류에 대한 상담이 시작돼요.
              </motion.p>
              <motion.div
                className={styles.entrySuggestions}
                aria-label="추천 질문"
                variants={entrySuggestionListVariants}
              >
                {DOCUMENT_ENTRY_QUESTIONS.map((question) => (
                  <motion.button
                    key={question}
                    type="button"
                    className={styles.entrySuggestionCard}
                    onClick={() => handleSend(question)}
                    disabled={isSending || !selectedDocument}
                    custom={prefersReducedMotion}
                    variants={entrySuggestionVariants}
                    whileHover={
                      prefersReducedMotion || isSending || !selectedDocument
                        ? undefined
                        : { y: -2 }
                    }
                    whileTap={
                      prefersReducedMotion || isSending || !selectedDocument
                        ? undefined
                        : { scale: 0.99 }
                    }
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    {question}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          )}
          {isLoading && (
            <p className={`${styles.status} ${styles.chatContent}`}>맞춤 준비서류를 불러오는 중입니다.</p>
          )}
          {!isLoading && error && checklistCompleted === true && (
            <p className={`${styles.status} ${styles.chatContent}`}>
              맞춤 준비서류를 불러오지 못했습니다. 체크리스트 완료 후 다시 시도해주세요.
            </p>
          )}
          {!isLoading && !isChecklistLoading && isLocked && (
            <motion.div
              className={styles.lockBox}
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : DOCUMENT_CHAT_TRANSITION}
            >
              <div className={styles.lockIcon}>
                <FaLock aria-hidden="true" />
              </div>
              <p className={styles.lockTitle}>
                서류를 업로드하면
                <br />
                상담이 활성화됩니다
              </p>
              <p className={styles.lockDescription}>먼저 체크리스트에서 서류를 준비해 주세요</p>
            </motion.div>
          )}
        </div>

        <div className={styles.inputDock}>
          <motion.div
            className={styles.chatContent}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    ...DOCUMENT_CHAT_TRANSITION,
                    delay: 0.34,
                  }
            }
          >
            {!isChecklistLoading && !isLocked && selectedDocument && (
              <motion.div
                key={`${selectedDocument.documentId}-${selectedVariant?.variantId ?? 'document'}`}
                className={styles.selectionBar}
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8, scale: prefersReducedMotion ? 1 : 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: prefersReducedMotion ? 0.2 : 0.38, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={styles.selectionContent}>
                  <span className={styles.selectionLabel}>상담 중</span>
                  <span className={styles.selectionTitle}>
                    {selectedVariant?.title ?? selectedDocument.documentName}
                  </span>
                </div>
              </motion.div>
            )}
            <ChatInput
              onSend={handleSend}
              disabled={isLocked || isSending}
              placeholder={
                isLocked
                  ? '체크리스트 완료 후 상담이 활성화됩니다'
                    : selectedDocument
                      ? '선택한 서류에 대해 궁금한 점을 입력하세요'
                    : '오른쪽 목록에서 상담할 서류를 먼저 선택하세요'
              }
            />
          </motion.div>
        </div>
      </div>

      <div className={styles.sidePane}>
        {isChecklistLoading || isLoading ? (
          <p className={styles.sideStatus}>맞춤 준비서류를 불러오는 중입니다.</p>
        ) : isLocked ? (
          <motion.div
            className={styles.emptyPanel}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : DOCUMENT_CHAT_TRANSITION}
          >
            <div className={styles.emptyIcon}>
              <FaFileLines aria-hidden="true" />
            </div>
            <p className={styles.emptyTitle}>아직 업로드된 서류가 없어요</p>
            <p className={styles.emptyDescription}>
              체크리스트에서 서류를 업로드하고 OCR 확인을 마치면
              <br />이 화면에서 상담을 이어갈 수 있어요
            </p>
            <button type="button" className={styles.emptyCta} onClick={() => navigate('/guarantee-checklist')}>
              체크리스트로 이동 <FaArrowRight aria-hidden="true" />
            </button>
          </motion.div>
        ) : (
          <ChecklistPanel
            sections={sections}
            documents={documents}
            totalDocumentCount={preparation.totalDocumentCount}
            preparedDocumentCount={preparation.preparedDocumentCount}
            activeSectionCode={activeSectionCode}
            expandedDocumentId={expandedDocumentId}
            selectedDocumentId={selectedDocumentId}
            onChangeSection={setActiveSectionCode}
            onTogglePrepared={handleTogglePrepared}
            onToggleExpanded={handleToggleExpanded}
            onSelectVariant={handleSelectVariant}
            onSelectDocument={handleSelectDocument}
            isUpdating={isUpdating}
          />
        )}
      </div>
    </div>
  );
}
