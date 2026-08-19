import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { FaArrowRight, FaFileLines, FaLock, FaRegMessage } from 'react-icons/fa6';
import ChatInput from '../../../components/chat/ChatInput/ChatInput.jsx';
import MessageList from '../../../components/chat/MessageList/MessageList.jsx';
import { useDocumentPreparation } from '../../../hooks/useDocumentPreparation.js';
import { LAST_DOCUMENT_CHAT_APPLICATION_ID_KEY } from '../../../hooks/useContractUpload.js';
import { sendDocumentMessage } from '../../../services/docChat/docChatService.js';
import { getChecklistCompletion, getInfo } from '../../../services/checklist/checklistService.js';
import ChecklistPanel from './ChecklistPanel/ChecklistPanel.jsx';
import styles from './DocumentChat.module.css';

const DOCUMENT_CHAT_TRANSITION = {
  duration: 1.25,
  ease: [0.16, 1, 0.3, 1],
};

const CONTRACT_VARIANTS = [
  {
    variantId: 'new-fixed',
    title: '확정일자부 신규 전세계약서',
    description: '최초 체결한 계약 · 확정일자 받은본',
  },
  {
    variantId: 'renewal',
    title: '갱신(재계약) 전세계약서',
    description: '기존 계약 갱신 · 변경된 조건 확인',
  },
  {
    variantId: 'increase',
    title: '보증금 증액 전세계약서',
    description: '증액된 보증금 및 변경 계약 확인',
  },
  {
    variantId: 'house',
    title: '단독·다중·다가구 전세계약서',
    description: '단독·다중·다가구 주택 계약 시 필요',
  },
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
  const isLeaseContract = documentName.includes('전세계약서') || documentName.includes('임대차계약서');

  return {
    ...document,
    sectionCode,
    documentName,
    description: document.description ?? '',
    prepared: Boolean(document.prepared),
    selectableVariants: document.selectableVariants ?? (isLeaseContract ? CONTRACT_VARIANTS : undefined),
    selectedVariantId: variantSelections[document.documentId] ?? document.selectedVariantId ?? 'renewal',
  };
}

function hasOcrInfo(info) {
  return Boolean(
    info?.applicationId ||
      info?.contractAddress ||
      info?.housingTypeCode ||
      info?.housingType ||
      info?.contractType,
  );
}

export default function DocumentChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const [checklistCompleted, setChecklistCompleted] = useState(null);
  const [hasAnalyzedContract, setHasAnalyzedContract] = useState(null);
  const [checklistCheckError, setChecklistCheckError] = useState(null);
  const [activeSectionCode, setActiveSectionCode] = useState('BASIC');
  const [expandedDocumentId, setExpandedDocumentId] = useState(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [variantSelections, setVariantSelections] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let ignore = false;
    const routeApplicationId = location.state?.applicationId;
    const savedApplicationId =
      routeApplicationId ?? sessionStorage.getItem(LAST_DOCUMENT_CHAT_APPLICATION_ID_KEY);

    if (!savedApplicationId) {
      setHasAnalyzedContract(false);
      return () => {
        ignore = true;
      };
    }

    sessionStorage.setItem(LAST_DOCUMENT_CHAT_APPLICATION_ID_KEY, String(savedApplicationId));

    getInfo(savedApplicationId)
      .then((info) => {
        if (!ignore) setHasAnalyzedContract(hasOcrInfo(info));
      })
      .catch(() => {
        if (!ignore) setHasAnalyzedContract(false);
      });

    return () => {
      ignore = true;
    };
  }, [location.state?.applicationId]);

  useEffect(() => {
    let ignore = false;

    getChecklistCompletion()
      .then((completed) => {
        if (!ignore) setChecklistCompleted(completed);
      })
      .catch((requestError) => {
        if (!ignore) {
          setChecklistCheckError(requestError);
          setChecklistCompleted(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const {
    preparation,
    isLoading,
    isUpdating,
    error,
    changePrepared,
  } = useDocumentPreparation(checklistCompleted === true && hasAnalyzedContract === true);

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
  const isChecklistLoading = checklistCompleted === null || hasAnalyzedContract === null;
  const isLocked = checklistCompleted !== true || hasAnalyzedContract !== true || !hasPreparation;
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
    setSelectedDocumentId(documentId);
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
              <MessageList messages={messages} animateMessages />
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
              className={`${styles.guideBox} ${styles.chatContent}`}
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : DOCUMENT_CHAT_TRANSITION}
            >
              <div className={styles.guideIcon}>
                <FaRegMessage aria-hidden="true" />
              </div>
              <div className={styles.guideText}>
                <p className={styles.guideTitle}>상담할 서류를 고른 뒤 질문을 입력해 주세요</p>
                <p className={styles.guideDescription}>
                  오른쪽 서류 목록에서 궁금한 서류를 선택하고, 입력창에 직접 질문하면 해당 서류 기준으로 안내해 드립니다.
                </p>
                <div className={styles.guideExamples} aria-label="질문 예시">
                  <span>이 서류는 어떻게 준비해야 하나요?</span>
                  <span>어디서 발급받을 수 있나요?</span>
                  <span>제출할 때 주의할 점이 있나요?</span>
                </div>
              </div>
            </motion.div>
          )}
          {isLoading && (
            <p className={`${styles.status} ${styles.chatContent}`}>맞춤 준비서류를 불러오는 중입니다.</p>
          )}
          {!isLoading && (error || checklistCheckError) && checklistCompleted === true && (
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
                isLocked ? '체크리스트 완료 후 상담이 활성화됩니다' : '서류를 선택한 뒤 궁금한 점을 입력하세요'
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
