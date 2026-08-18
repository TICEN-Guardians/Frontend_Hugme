import { useEffect, useState } from 'react';
import { FaCircleCheck, FaFileLines } from 'react-icons/fa6';
import { useParams } from 'react-router-dom';
import AnalyzingModal from '../../components/checklist/AnalyzingModal/AnalyzingModal.jsx';
import OcrConfirmModal from '../../components/checklist/OcrConfirmModal/OcrConfirmModal.jsx';
import QuestionModal from '../../components/checklist/QuestionModal/QuestionModal.jsx';
import Button from '../../components/common/Button/Button.jsx';
import DocumentCard from '../../components/common/DocumentCard/DocumentCard.jsx';
import Modal from '../../components/common/Modal/Modal.jsx';
import TabBar from '../../components/common/TabBar/TabBar.jsx';
import { PRODUCT_THEME } from '../../constants/products.js';
import { useContractUpload } from '../../hooks/useContractUpload.js';
import { useProductChecklist } from '../../hooks/useProductChecklist.js';
import { useQuestionFlow } from '../../hooks/useQuestionFlow.js';
import ErrorPage from '../ErrorPage/ErrorPage.jsx';
import ChecklistBanner from './ChecklistBanner/ChecklistBanner.jsx';
import FinalDocumentList from './FinalDocumentList/FinalDocumentList.jsx';
import styles from './ProductChecklistPage.module.css';

const PRODUCT_TITLES = {
  GENERAL: '전세보증금반환보증',
  SPECIAL: '특례반환보증(임차인형)',
};

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

export default function ProductChecklistPage() {
  const { productCode } = useParams();
  const theme = PRODUCT_THEME[productCode];

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

  const {
    step,
    applicationId,
    ocrInfo,
    uploadError,
    isConfirming,
    finalDocuments,
    startUpload,
    confirmOcrInfo,
    closeOcrConfirm,
    finishQuestions,
  } = useContractUpload(productCode);

  const questionFlow = useQuestionFlow(applicationId);

  // OCR 확정이 끝나 'questions' 단계로 넘어오면, 최초 1회 STEP1 질문을 불러온다.
  useEffect(() => {
    if (
      step === 'questions' &&
      questionFlow.questionStep == null &&
      questionFlow.visitedSteps.length === 0 &&
      !questionFlow.isLoading
    ) {
      questionFlow.start();
    }
  }, [
    step,
    questionFlow.questionStep,
    questionFlow.visitedSteps.length,
    questionFlow.isLoading,
    questionFlow.start,
  ]);

  const handleSubmitStep = async (selectedOptionIds) => {
    const done = await questionFlow.submitStep(selectedOptionIds);
    if (done) {
      await finishQuestions();
    }
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
  const isDone = step === 'done' && finalDocuments;
  const selectedItem = items.find((item) => item.itemId === selectedItemId) ?? null;
  const modalDocumentEntries = groupModalDocuments(documents);

  const handleItemClick = async (itemId) => {
    setExpandedDocumentGroupIds([]);
    setSelectedItemId(itemId);
    await changeItem(itemId);
  };

  const toggleDocumentGroup = (groupId) => {
    setExpandedDocumentGroupIds((current) =>
      current.includes(groupId)
        ? current.filter((currentGroupId) => currentGroupId !== groupId)
        : [...current, groupId],
    );
  };

  const closeItemModal = () => {
    setSelectedItemId(null);
    setExpandedDocumentGroupIds([]);
  };

  return (
    <div className={styles.root} data-theme={theme}>
      <p className={styles.eyebrow}>보증가입 준비물 확인</p>
      <h1 className={styles.title}>{PRODUCT_TITLES[productCode]}</h1>

      {isDone ? (
        <div className={styles.doneBanner}>
          <p className={styles.doneBannerTitle}>
            <FaCircleCheck aria-hidden="true" /> 임대차계약서 분석 완료
          </p>
          {/* TODO: 다시 분석(재업로드) 플로우는 다음 차수에서 연결 */}
          <Button type="button" variant="secondary" onClick={() => {}}>
            다시 분석
          </Button>
        </div>
      ) : (
        <ChecklistBanner onFileSelected={startUpload} />
      )}
      {uploadError && (
        <p className={styles.status}>계약서 업로드에 실패했습니다. 다시 시도해주세요.</p>
      )}

      {status === 'loading' && <p className={styles.status}>불러오는 중...</p>}
      {status === 'error' && (
        <p className={styles.status}>목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
      )}

      {isDone ? (
        <FinalDocumentList result={finalDocuments} />
      ) : (
        status === 'success' && (
          <>
            <TabBar tabs={sectionTabs} activeKey={activeSectionCode} onChange={changeSection} />

            {/* 추가서류처럼 groupName이 있는 섹션에서만 그룹 탭을 표시한다. */}
            <div className={styles.pillSlot}>
              {groupTabs.length > 0 && (
                <TabBar
                  tabs={groupTabs}
                  activeKey={activeGroupId}
                  onChange={changeGroup}
                  variant="pill"
                />
              )}
            </div>

            <div className={styles.itemArea}>
              {isSectionLoading ? (
                <p className={styles.status}>불러오는 중...</p>
              ) : items.length === 0 ? (
                <p className={styles.empty}>해당 항목에 표시할 서류가 없습니다.</p>
              ) : (
                <div className={styles.grid}>
                  {items.map((item) => (
                    <DocumentCard
                      key={item.itemId}
                      icon={<FaFileLines />}
                      title={item.itemName}
                      singleLine
                      onClick={() => handleItemClick(item.itemId)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )
      )}

      <Modal isOpen={selectedItemId != null} onClose={closeItemModal}>
        {selectedItem && (
          <div className={styles.detail}>
            <h2 className={styles.detailTitle}>{selectedItem.itemName}</h2>
            <h3 className={styles.detailSubtitle}>실제 준비 서류</h3>
            {isDocumentsLoading ? (
              <p className={styles.status}>불러오는 중...</p>
            ) : documents.length === 0 ? (
              <p className={styles.empty}>표시할 준비 서류가 없습니다.</p>
            ) : (
              <div className={styles.modalDocumentList}>
                {modalDocumentEntries.map((entry) => {
                  if (entry.type === 'document') {
                    const { document } = entry;
                    return (
                      <div key={entry.key} className={styles.variantItem}>
                        <span className={styles.variantDot} />
                        <div>
                          <strong>{document.title}</strong>
                          {document.description && <p>{document.description}</p>}
                        </div>
                      </div>
                    );
                  }

                  const isExpanded = expandedDocumentGroupIds.includes(entry.groupId);
                  return (
                    <div key={entry.key} className={styles.documentGroup}>
                      <DocumentCard
                        icon={<FaFileLines />}
                        title={entry.groupName}
                        description={`${entry.documents.length}개의 준비 서류`}
                        expanded={isExpanded}
                        onClick={() => toggleDocumentGroup(entry.groupId)}
                      />
                      {isExpanded && (
                        <div className={styles.inlineDocumentList}>
                          {entry.documents.map((document) => (
                            <div key={document.documentId} className={styles.inlineDocument}>
                              <span className={styles.variantDot} />
                              <div>
                                <strong>{document.title}</strong>
                                {document.description && <p>{document.description}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Modal>

      <AnalyzingModal isOpen={step === 'analyzing'} />

      <OcrConfirmModal
        isOpen={step === 'ocrConfirm'}
        onClose={closeOcrConfirm}
        initialInfo={ocrInfo}
        onConfirm={confirmOcrInfo}
        isSubmitting={isConfirming}
      />

      <QuestionModal
        isOpen={step === 'questions' && questionFlow.questionStep != null}
        questionStep={questionFlow.questionStep}
        questions={questionFlow.questions}
        isFinalStep={questionFlow.isFinalStep}
        visitedSteps={questionFlow.visitedSteps}
        isSubmitting={questionFlow.isSubmitting}
        onSubmitStep={handleSubmitStep}
      />
    </div>
  );
}
