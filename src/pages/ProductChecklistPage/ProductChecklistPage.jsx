import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FaChevronRight, FaCircleCheck, FaCircleInfo, FaFileLines } from 'react-icons/fa6';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import AnalyzingModal from '../../components/checklist/AnalyzingModal/AnalyzingModal.jsx';
import KakaoNotificationModal from '../../components/checklist/KakaoNotificationModal/KakaoNotificationModal.jsx';
import OcrConfirmModal from '../../components/checklist/OcrConfirmModal/OcrConfirmModal.jsx';
import QuestionModal from '../../components/checklist/QuestionModal/QuestionModal.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Modal from '../../components/common/Modal/Modal.jsx';
import TabBar from '../../components/common/TabBar/TabBar.jsx';
import {
  getPrepareQuestions,
  submitPrepareAnswers,
} from '../../api/checklist/prepareChecklistService.js';
import {
  createKakaoAuthorization,
  KAKAO_NOTIFICATION_PENDING_KEY,
} from '../../api/notification/notificationService.js';
import { GUARANTEE_THEME, PRODUCT_ROUTE_TO_CODE } from '../../constants/products.js';
import { useAuth } from '../../context/auth/AuthContext.jsx';
import { useContractUpload } from '../../hooks/useContractUpload.js';
import { usePrepareChecklist } from '../../hooks/usePrepareChecklist.js';
import { useProductChecklist } from '../../hooks/useProductChecklist.js';
import { useQuestionFlow } from '../../hooks/useQuestionFlow.js';
import ErrorPage from '../ErrorPage/ErrorPage.jsx';
import ChecklistBanner from './ChecklistBanner/ChecklistBanner.jsx';
import FinalDocumentList from './FinalDocumentList/FinalDocumentList.jsx';
import styles from './ProductChecklistPage.module.css';

const ENTRY_EASE = [0.16, 1, 0.3, 1];

const PRODUCT_TITLES = {
  GENERAL: '전세보증금반환보증',
  SPECIAL: '특례반환보증',
};

const PANEL_EASE = [0.22, 1, 0.36, 1];
const SELECTOR_STAGGER = 0.035;
const CONTRACT_ACCEPT_ATTR = 'image/*';
const CONTRACT_MAX_FILE_SIZE = 20 * 1024 * 1024;

const selectorListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: PANEL_EASE,
      staggerChildren: SELECTOR_STAGGER,
    },
  },
};

const selectorItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: PANEL_EASE,
    },
  },
};

const HOUSING_TYPE_LABEL = {
  APARTMENT: '아파트',
  OFFICETEL: '오피스텔',
  VILLA: '빌라·다세대·연립주택',
  HOUSE: '단독·다가구주택',
};

const CONTRACT_TYPE_LABEL = {
  NEW: '신규계약',
  RENEWAL: '갱신계약',
};

const PARTY_TYPE_LABEL = {
  PERSON: '개인',
  COMPANY: '법인',
};

function displayValue(value, labels) {
  if (value === null || value === undefined || value === '') return null;
  return labels?.[value] ?? value;
}

function fixedDateLabel(info) {
  if (info?.fixedDateConfirmed === true || info?.fixedDateStatus === 'RECEIVED') {
    return '확인됨';
  }
  if (info?.fixedDateConfirmed === false || info?.fixedDateStatus === 'NOT_RECEIVED') {
    return '미확인';
  }
  return null;
}

function buildOcrSummaryItems(ocrInfo) {
  if (!ocrInfo) return [];

  return [
    { label: '계약 주소', value: displayValue(ocrInfo.contractAddress) },
    {
      label: '주택 유형',
      value: displayValue(ocrInfo.housingTypeCode ?? ocrInfo.housingType, HOUSING_TYPE_LABEL),
    },
    { label: '계약 유형', value: displayValue(ocrInfo.contractType, CONTRACT_TYPE_LABEL) },
    { label: '임차인 유형', value: displayValue(ocrInfo.tenantType, PARTY_TYPE_LABEL) },
    { label: '임대인 유형', value: displayValue(ocrInfo.landlordType, PARTY_TYPE_LABEL) },
    { label: '확정일자', value: fixedDateLabel(ocrInfo), tone: 'success' },
    ocrInfo.officetelResidential
      ? { label: '오피스텔 주거용 여부', value: displayValue(ocrInfo.officetelResidential) }
      : null,
    ocrInfo.landlordProxyContract
      ? { label: '임대인 대리계약 여부', value: displayValue(ocrInfo.landlordProxyContract) }
      : null,
  ].filter((item) => item?.value);
}

function groupModalDocuments(documents) {
  const entries = [];
  const groupsById = new Map();

  documents.forEach((document) => {
    if (document.documentGroupId == null || !document.documentGroupName) {
      entries.push({ type: 'document', key: `document-${document.documentId}`, document });
      return;
    }

    if (!groupsById.has(document.documentGroupId)) {
      const group = {
        type: 'group',
        key: `group-${document.documentGroupId}`,
        groupId: document.documentGroupId,
        groupName: document.documentGroupName,
        sortOrder: document.documentGroupSortOrder,
        documents: [],
      };
      groupsById.set(document.documentGroupId, group);
      entries.push(group);
    }
    groupsById.get(document.documentGroupId).documents.push(document);
  });

  return entries;
}

function ReanalysisConfirmModal({ isOpen, onClose, onConfirm }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} panelClassName={styles.reanalysisModal}>
      <div className={styles.reanalysisContent}>
        <p className={styles.reanalysisEyebrow}>다시 분석</p>
        <h2 className={styles.reanalysisTitle}>계약서를 다시 분석할까요?</h2>
        <p className={styles.reanalysisDescription}>
          다시 분석하면 이전 OCR 분석 결과와 확정된 준비서류가 새 계약서 기준으로 바뀝니다.
          서류안내 챗봇에 연결된 서류 목록도 다시 생성됩니다.
        </p>
        <div className={styles.reanalysisActions}>
          <Button type="button" variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button type="button" onClick={onConfirm}>
            다시 분석하기
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ExistingChecklistConfirmModal({ isOpen, onClose, onUseExisting, onStartNew }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} panelClassName={styles.reanalysisModal}>
      <div className={styles.reanalysisContent}>
        <p className={styles.reanalysisEyebrow}>기존 내역 확인</p>
        <h2 className={styles.reanalysisTitle}>기존 준비서류 내역이 있어요</h2>
        <p className={styles.reanalysisDescription}>
          기존 신청의 최종 준비서류를 확인하거나,
          <br />
          새 계약서로 다시 진행할 수 있어요.
        </p>
        <div className={styles.reanalysisActions}>
          <Button type="button" variant="secondary" onClick={onStartNew}>
            신규 진행
          </Button>
          <Button type="button" onClick={onUseExisting}>
            기존 내역 보기
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ContractAnalysisPanel({
  isDone,
  ocrInfo,
  onUpload,
  onBeforeUpload,
  isPreparingUpload,
  uploadError,
  onPrepareTest,
  isPreparingTest,
  prepareError,
  onReset,
  onChat,
  onKakaoNotification,
}) {
  const summaryItems = buildOcrSummaryItems(ocrInfo);
  const fileInputRef = useRef(null);
  const [fileError, setFileError] = useState('');
  const [isReanalysisConfirmOpen, setIsReanalysisConfirmOpen] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFileError('이미지 파일만 업로드할 수 있어요.');
      return;
    }
    if (file.size > CONTRACT_MAX_FILE_SIZE) {
      setFileError('파일 용량은 20MB를 넘을 수 없어요.');
      return;
    }

    setFileError('');
    onUpload(file);
  };

  const handleConfirmReanalysis = () => {
    setIsReanalysisConfirmOpen(false);
    onReset?.();
    fileInputRef.current?.click();
  };

  if (!isDone) {
    return (
      <motion.section
        className={styles.checklistEntryPanel}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: PANEL_EASE }}
      >
        <ChecklistBanner
          onFileSelected={onUpload}
          onBeforeUpload={onBeforeUpload}
          isPreparingUpload={isPreparingUpload}
          onPrepareTest={onPrepareTest}
          isPreparingTest={isPreparingTest}
        />
        {uploadError && (
          <p className={styles.uploadError}>계약서 업로드에 실패했습니다. 다시 시도해주세요.</p>
        )}
        {prepareError && (
          <p className={styles.uploadError}>모의테스트를 시작하지 못했습니다. 다시 시도해주세요.</p>
        )}
      </motion.section>
    );
  }

  return (
    <motion.section
      className={styles.analysisPanel}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: PANEL_EASE }}
    >
      <div className={styles.analysisHeader}>
        <div>
          <p className={styles.doneBannerTitle}>
            <FaCircleCheck aria-hidden="true" /> 계약서 분석 완료
          </p>
          <h2 className={styles.analysisTitle}>내 계약 분석 결과</h2>
        </div>
        <div className={styles.analysisActions}>
          <input
            ref={fileInputRef}
            type="file"
            accept={CONTRACT_ACCEPT_ATTR}
            onChange={handleFileChange}
            className={styles.hiddenInput}
          />
          <Button type="button" variant="secondary" onClick={() => setIsReanalysisConfirmOpen(true)}>
            다시 분석
          </Button>
          <Button
            type="button"
            variant="secondary"
            className={styles.kakaoButton}
            onClick={onKakaoNotification}
          >
            카카오 알림 보내기
          </Button>
          <Button type="button" onClick={onChat}>
            서류안내 챗봇
          </Button>
        </div>
      </div>

      {summaryItems.length > 0 && (
        <div className={styles.summaryGrid}>
          {summaryItems.map((item) => (
            <div key={item.label} className={styles.summaryItem}>
              <span className={styles.summaryLabel}>{item.label}</span>
              <strong className={styles.summaryValue}>
                {item.tone === 'success' && <FaCircleCheck aria-hidden="true" />}
                {item.value}
              </strong>
            </div>
          ))}
        </div>
      )}
      {(fileError || uploadError) && (
        <p className={styles.uploadError}>
          {fileError || '계약서 업로드에 실패했습니다. 다시 시도해주세요.'}
        </p>
      )}
      <ReanalysisConfirmModal
        isOpen={isReanalysisConfirmOpen}
        onClose={() => setIsReanalysisConfirmOpen(false)}
        onConfirm={handleConfirmReanalysis}
      />
    </motion.section>
  );
}

function PrepareResultPanel({ onRestart }) {
  return (
    <motion.section
      className={styles.analysisPanel}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: PANEL_EASE }}
    >
      <div className={styles.analysisHeader}>
        <div>
          <p className={styles.doneBannerTitle}>
            <FaCircleCheck aria-hidden="true" /> 모의테스트 완료
          </p>
          <h2 className={styles.analysisTitle}>예상 준비서류</h2>
        </div>
        <div className={styles.analysisActions}>
          <Button type="button" variant="secondary" onClick={onRestart}>
            다시 테스트
          </Button>
        </div>
      </div>
      <p className={styles.reanalysisDescription}>
        선택한 조건을 기준으로 계산한 결과이며 실제 신청 내역에는 저장되지 않아요.
      </p>
    </motion.section>
  );
}

function DocumentSelector({
  items,
  selectedItemId,
  onSelect,
  groupTabs,
  activeGroupId,
  onGroupChange,
}) {
  return (
    <div className={styles.selectorPanel}>
      {groupTabs.length > 0 && (
        <div className={styles.groupFilterRow} aria-label="추가서류 분류">
          {groupTabs.map((group) => (
            <button
              key={group.key}
              type="button"
              className={styles.groupFilterButton}
              data-selected={group.key === activeGroupId}
              onClick={() => onGroupChange(group.key)}
            >
              {group.label}
            </button>
          ))}
        </div>
      )}
      <motion.div
        className={styles.documentList}
        variants={selectorListVariants}
        initial="hidden"
        animate="visible"
      >
        {items.map((item) => {
          const isSelected = item.itemId === selectedItemId;
          return (
            <motion.button
              key={item.itemId}
              type="button"
              className={styles.selectorButton}
              data-selected={isSelected}
              aria-pressed={isSelected}
              onClick={() => onSelect(item.itemId)}
              variants={selectorItemVariants}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.995 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <FaFileLines className={styles.selectorIcon} aria-hidden="true" />
              <span className={styles.selectorTitle}>{item.itemName}</span>
              <FaChevronRight className={styles.selectorChevron} aria-hidden="true" />
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

function DocumentDetail({
  selectedItem,
  entries,
  isLoading,
  expandedGroupIds,
  onToggleGroup,
}) {
  return (
    <section className={styles.detailPanel} aria-live="polite">
      <AnimatePresence mode="wait">
        {selectedItem ? (
          <motion.div
            key={selectedItem.itemId}
            className={styles.detailContent}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.5, ease: PANEL_EASE }}
          >
            <p className={styles.previewEyebrow}>선택한 서류</p>
            <h2 className={styles.detailTitle}>{selectedItem.itemName}</h2>

            {isLoading ? (
              <p className={styles.status}>불러오는 중...</p>
            ) : entries.length > 0 ? (
              <div className={styles.detailSection}>
                <h3 className={styles.detailSubtitle}>실제 준비 서류</h3>
                <div className={styles.variantGrid}>
                  {entries.map((entry) => {
                    if (entry.type === 'document') {
                      const { document } = entry;
                      return (
                        <div key={entry.key} className={styles.variantItem}>
                          <span className={styles.variantDot} />
                          <div>
                            <strong>{document.title ?? document.documentName}</strong>
                            {document.description && <p>{document.description}</p>}
                            {Array.isArray(document.acceptedVariants) &&
                              document.acceptedVariants.length > 0 && (
                                <div className={styles.acceptedVariantList}>
                                  {document.acceptedVariants.map((variant) => (
                                    <span key={variant} className={styles.acceptedVariant}>
                                      <span className={styles.variantDot} />
                                      {variant}
                                    </span>
                                  ))}
                                </div>
                              )}
                            {document.sampleImageUrl && (
                              <img
                                className={styles.sampleImage}
                                src={document.sampleImageUrl}
                                alt={`${document.title ?? document.documentName} 예시`}
                              />
                            )}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={entry.key} className={styles.documentGroup}>
                        <div className={styles.groupSummary}>
                          <span>{entry.groupName}</span>
                          <small>{entry.documents.length}개</small>
                        </div>
                        <div className={styles.inlineDocumentList}>
                          {entry.documents.map((document) => (
                            <div key={document.documentId} className={styles.inlineDocument}>
                              <span className={styles.variantDot} />
                              <div>
                                <strong>{document.title ?? document.documentName}</strong>
                                {document.description && <p>{document.description}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className={styles.empty}>표시할 준비 서류가 없습니다.</p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            className={styles.previewEmpty}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.5, ease: PANEL_EASE }}
          >
            <FaCircleInfo className={styles.previewIcon} aria-hidden="true" />
            <h2>서류를 선택해 주세요</h2>
            <p>왼쪽 목록에서 서류를 선택하면 상세정보를 확인할 수 있어요.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default function ProductChecklistPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const { productCode: productCodeParam, guaranteeType } = useParams();
  const productCode = PRODUCT_ROUTE_TO_CODE[productCodeParam] ?? PRODUCT_ROUTE_TO_CODE[guaranteeType];
  const theme = GUARANTEE_THEME[productCode]?.theme;

  // Modal은 document.body로 portal되기 때문에, 페이지 루트에만 data-theme을 걸면
  // 모달 안에서 --accent 계열 토큰이 상속되지 않는다. html에도 같이 걸어서 맞춘다.
  useEffect(() => {
    if (!theme) return undefined;
    const root = document.documentElement;
    const previous = root.getAttribute('data-theme');
    root.setAttribute('data-theme', theme);
    return () => {
      if (previous) {
        root.setAttribute('data-theme', previous);
      } else {
        root.removeAttribute('data-theme');
      }
    };
  }, [theme]);

  const {
    sections,
    activeSectionCode,
    groups,
    activeGroupId,
    items,
    documents,
    status,
    isSectionLoading,
    isDocumentsLoading,
    changeSection,
    changeGroup,
    changeItem,
  } = useProductChecklist(productCode);

  const [selectedItemId, setSelectedItemId] = useState(null);
  const [expandedDocumentGroupIds, setExpandedDocumentGroupIds] = useState([]);
  const [isKakaoModalOpen, setIsKakaoModalOpen] = useState(false);
  const [isKakaoAuthorizing, setIsKakaoAuthorizing] = useState(false);
  const [kakaoError, setKakaoError] = useState('');

  const {
    step,
    applicationId,
    ocrInfo,
    uploadError,
    isConfirming,
    isRestoring,
    isPreparingUpload,
    isExistingChecklistModalOpen,
    finalDocuments,
    prepareUpload,
    useExistingChecklist,
    startNewChecklist,
    closeExistingChecklistModal,
    startUpload,
    restartUpload,
    confirmOcrInfo,
    closeOcrConfirm,
    reopenOcrConfirm,
    finishQuestions,
  } = useContractUpload(productCode, {
    isAuthenticated,
    isAuthLoading,
  });

  const questionFlow = useQuestionFlow(applicationId);
  const prepareChecklist = usePrepareChecklist(productCode);
  const prepareQuestionFlow = useQuestionFlow(prepareChecklist.applicationId, {
    getQuestionsRequest: getPrepareQuestions,
    submitAnswersRequest: submitPrepareAnswers,
  });

  // OCR 확정이 끝나 'questions' 단계로 넘어오면, 최초 1회 STEP1 질문을 불러온다.
  useEffect(() => {
    if (
      step === 'questions' &&
      questionFlow.questionStep == null &&
      questionFlow.visitedSteps.length === 0 &&
      !questionFlow.isLoading &&
      !questionFlow.error
    ) {
      questionFlow.start();
    }
  }, [
    step,
    questionFlow.questionStep,
    questionFlow.visitedSteps.length,
    questionFlow.isLoading,
    questionFlow.error,
    questionFlow.start,
  ]);

  // 모의 계약정보가 확정되면 prepare 전용 API로 STEP1 질문을 불러온다.
  useEffect(() => {
    if (
      prepareChecklist.step === 'questions' &&
      prepareQuestionFlow.questionStep == null &&
      prepareQuestionFlow.visitedSteps.length === 0 &&
      !prepareQuestionFlow.isLoading &&
      !prepareQuestionFlow.error
    ) {
      prepareQuestionFlow.start();
    }
  }, [
    prepareChecklist.step,
    prepareQuestionFlow.questionStep,
    prepareQuestionFlow.visitedSteps.length,
    prepareQuestionFlow.isLoading,
    prepareQuestionFlow.error,
    prepareQuestionFlow.start,
  ]);

  const handleSubmitStep = async (selectedOptionIds) => {
    const done = await questionFlow.submitStep(selectedOptionIds);
    if (done) {
      await finishQuestions();
    }
  };

  const handleQuestionBack = () => {
    if (questionFlow.canGoBack) {
      questionFlow.goBack();
      return;
    }

    questionFlow.reset();
    reopenOcrConfirm();
  };

  const handleQuestionClose = () => {
    if (questionFlow.isSubmitting) return;

    questionFlow.reset();
    closeOcrConfirm();
  };

  const handleOpenKakaoNotification = () => {
    setKakaoError('');
    setIsKakaoModalOpen(true);
  };

  const handleCloseKakaoNotification = () => {
    if (isKakaoAuthorizing) return;
    setIsKakaoModalOpen(false);
    setKakaoError('');
  };

  const handleKakaoNotification = async (dates) => {
    if (applicationId == null || isKakaoAuthorizing) return;

    setIsKakaoAuthorizing(true);
    setKakaoError('');

    try {
      const response = await createKakaoAuthorization(applicationId);
      const authorizationUrl = response?.authorizationUrl;

      if (!authorizationUrl) {
        throw new Error('카카오 인증 주소가 응답에 없습니다.');
      }

      sessionStorage.setItem(
        KAKAO_NOTIFICATION_PENDING_KEY,
        JSON.stringify({
          applicationId,
          returnTo: `${location.pathname}${location.search}`,
          ...dates,
        }),
      );

      window.location.assign(authorizationUrl);
    } catch (error) {
      setKakaoError(
        error?.response?.data?.message ??
          '카카오 인증을 시작하지 못했습니다. 다시 시도해 주세요.',
      );
      setIsKakaoAuthorizing(false);
    }
  };

  const handlePrepareStart = async () => {
    prepareQuestionFlow.reset();
    await prepareChecklist.start();
  };

  const handlePrepareSubmitStep = async (selectedOptionIds) => {
    const done = await prepareQuestionFlow.submitStep(selectedOptionIds);
    if (done) {
      await prepareChecklist.finishQuestions();
    }
  };

  const handlePrepareQuestionBack = () => {
    if (prepareQuestionFlow.canGoBack) {
      prepareQuestionFlow.goBack();
      return;
    }

    prepareQuestionFlow.reset();
    prepareChecklist.reopenInfo();
  };

  const handlePrepareClose = () => {
    if (prepareQuestionFlow.isSubmitting || prepareChecklist.isConfirming) return;

    prepareQuestionFlow.reset();
    prepareChecklist.reset();
  };

  const handlePrepareRestart = () => {
    prepareQuestionFlow.reset();
    prepareChecklist.reset();
  };

  if (!theme) {
    return <ErrorPage />;
  }

  const sectionTabs = sections.map((section) => ({
    key: section.sectionCode,
    label: section.sectionTitle,
    count: section.documentCount,
  }));

  const groupTabs = groups.map((group) => ({
    key: group.groupId,
    label: group.groupName,
  }));
  const hasAnalysisResult = step === 'done' && Boolean(ocrInfo);
  const hasPrepareResult =
    prepareChecklist.step === 'done' && Boolean(prepareChecklist.finalDocuments);
  const selectedItem = items.find((item) => item.itemId === selectedItemId) ?? null;
  const modalDocumentEntries = groupModalDocuments(documents);

  const handleItemClick = async (itemId) => {
    setExpandedDocumentGroupIds([]);
    setSelectedItemId(itemId);
    await changeItem(itemId);
  };

  const handleSectionChange = async (sectionCode) => {
    setSelectedItemId(null);
    setExpandedDocumentGroupIds([]);
    await changeSection(sectionCode);
  };

  const handleGroupChange = (groupId) => {
    setSelectedItemId(null);
    setExpandedDocumentGroupIds([]);
    changeGroup(groupId);
  };

  const toggleDocumentGroup = (groupId) => {
    setExpandedDocumentGroupIds((current) =>
      current.includes(groupId)
        ? current.filter((currentGroupId) => currentGroupId !== groupId)
        : [...current, groupId],
    );
  };

  useEffect(() => {
    if (status !== 'success' || isSectionLoading || items.length === 0) return;
    if (selectedItemId != null && items.some((item) => item.itemId === selectedItemId)) return;

    handleItemClick(items[0].itemId);
  }, [status, isSectionLoading, items, selectedItemId]);

  return (
    <motion.div
      className={styles.root}
      data-theme={theme}
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0.3 : 1, ease: ENTRY_EASE }}
    >
      <div className={styles.headingBlock}>
        <p className={styles.eyebrow}>
          <Link to="/guarantee-checklist">보증가입 체크리스트</Link>
          <span aria-hidden="true">/</span>
          <span>준비물 확인</span>
        </p>
        <h1 className={styles.title}>{PRODUCT_TITLES[productCode]}</h1>
      </div>

      {(status === 'loading' || isRestoring) && <p className={styles.status}>불러오는 중...</p>}
      {status === 'error' && (
        <p className={styles.status}>목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
      )}

      {hasPrepareResult ? (
        <>
          <PrepareResultPanel onRestart={handlePrepareRestart} />
          <FinalDocumentList result={prepareChecklist.finalDocuments} />
        </>
      ) : hasAnalysisResult ? (
        <>
          <ContractAnalysisPanel
            isDone
            ocrInfo={ocrInfo}
            onUpload={restartUpload}
            uploadError={uploadError}
            onChat={() => navigate('/doc-chat', { state: { applicationId } })}
            onKakaoNotification={handleOpenKakaoNotification}
          />
          {finalDocuments ? (
            <FinalDocumentList result={finalDocuments} />
          ) : (
            status === 'success' && (
              <motion.section
                className={styles.board}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: PANEL_EASE }}
              >
                <div className={styles.boardHeader}>
                  <TabBar tabs={sectionTabs} activeKey={activeSectionCode} onChange={handleSectionChange} />
                </div>

                <div className={styles.itemArea}>
                  {isSectionLoading ? (
                    <p className={styles.status}>불러오는 중...</p>
                  ) : items.length === 0 ? (
                    <p className={styles.empty}>해당 항목에 표시할 서류가 없습니다.</p>
                  ) : (
                    <div className={styles.checklistLayout}>
                      <DocumentSelector
                        items={items}
                        selectedItemId={selectedItemId}
                        onSelect={handleItemClick}
                        groupTabs={groupTabs}
                        activeGroupId={activeGroupId}
                        onGroupChange={handleGroupChange}
                      />
                      <DocumentDetail
                        selectedItem={selectedItem}
                        entries={modalDocumentEntries}
                        isLoading={isDocumentsLoading}
                        expandedGroupIds={expandedDocumentGroupIds}
                        onToggleGroup={toggleDocumentGroup}
                      />
                    </div>
                  )}
                </div>
              </motion.section>
            )
          )}
        </>

      ) : (
        status === 'success' && !isRestoring && (
          <ContractAnalysisPanel
            isDone={false}
            onUpload={startUpload}
            onBeforeUpload={prepareUpload}
            isPreparingUpload={isPreparingUpload}
            uploadError={uploadError}
            onPrepareTest={handlePrepareStart}
            isPreparingTest={prepareChecklist.isStarting}
            prepareError={prepareChecklist.error}
          />
        )
      )}

      <AnalyzingModal isOpen={step === 'analyzing'} />

      <ExistingChecklistConfirmModal
        isOpen={isExistingChecklistModalOpen}
        onClose={closeExistingChecklistModal}
        onUseExisting={useExistingChecklist}
        onStartNew={startNewChecklist}
      />

      <OcrConfirmModal
        isOpen={step === 'ocrConfirm'}
        onClose={closeOcrConfirm}
        initialInfo={ocrInfo}
        onConfirm={confirmOcrInfo}
        isSubmitting={isConfirming}
      />

      <QuestionModal
        isOpen={step === 'questions'}
        questionStep={questionFlow.questionStep}
        questions={questionFlow.questions}
        isFinalStep={questionFlow.isFinalStep}
        visitedSteps={questionFlow.visitedSteps}
        initialAnswerIds={questionFlow.currentAnswerIds}
        isLoading={
          questionFlow.isLoading ||
          questionFlow.isSubmitting ||
          questionFlow.questionStep == null
        }
        isSubmitting={questionFlow.isSubmitting}
        onClose={handleQuestionClose}
        onBack={handleQuestionBack}
        onSubmitStep={handleSubmitStep}
      />

      <OcrConfirmModal
        isOpen={prepareChecklist.step === 'infoConfirm'}
        onClose={handlePrepareClose}
        initialInfo={prepareChecklist.info}
        onConfirm={prepareChecklist.confirmInfo}
        isSubmitting={prepareChecklist.isConfirming}
        mode="prepare"
      />

      <QuestionModal
        isOpen={prepareChecklist.step === 'questions'}
        questionStep={prepareQuestionFlow.questionStep}
        questions={prepareQuestionFlow.questions}
        isFinalStep={prepareQuestionFlow.isFinalStep}
        visitedSteps={prepareQuestionFlow.visitedSteps}
        initialAnswerIds={prepareQuestionFlow.currentAnswerIds}
        isLoading={
          prepareQuestionFlow.isLoading ||
          prepareQuestionFlow.isSubmitting ||
          prepareQuestionFlow.questionStep == null
        }
        isSubmitting={prepareQuestionFlow.isSubmitting}
        onClose={handlePrepareClose}
        onBack={handlePrepareQuestionBack}
        onSubmitStep={handlePrepareSubmitStep}
      />

      <KakaoNotificationModal
        isOpen={isKakaoModalOpen}
        onClose={handleCloseKakaoNotification}
        onSubmit={handleKakaoNotification}
        isSubmitting={isKakaoAuthorizing}
        error={kakaoError}
      />
    </motion.div>
  );
}
