import { useEffect, useState } from 'react';
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
    pills,
    activePillId,
    documents,
    status,
    isSectionLoading,
    isDocumentsLoading,
    changeSection,
    changePill,
  } = useProductChecklist(productCode);

  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

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
  } = useContractUpload();

  const questionFlow = useQuestionFlow(applicationId);

  // OCR 확정이 끝나 'questions' 단계로 넘어오면, 최초 1회 STEP1 질문을 불러온다.
  useEffect(() => {
    if (step === 'questions' && questionFlow.questionStep == null && !questionFlow.isLoading) {
      questionFlow.start();
    }
  }, [step, questionFlow.questionStep, questionFlow.isLoading, questionFlow.start]);

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

  const pillTabs = (pills ?? []).map((pill) => ({ key: pill.itemId, label: pill.label }));
  const isDone = step === 'done' && finalDocuments;

  const selectedDocument = documents.find((doc) => doc.documentId === selectedDocumentId) ?? null;

  return (
    <div className={styles.root} data-theme={theme}>
      <p className={styles.eyebrow}>보증가입 준비물 확인</p>
      <h1 className={styles.title}>{PRODUCT_TITLES[productCode]}</h1>

      {isDone ? (
        <div className={styles.doneBanner}>
          <p className={styles.doneBannerTitle}>✓ 임대차계약서 분석 완료</p>
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
        <FinalDocumentList sections={sections} documents={finalDocuments} />
      ) : (
        status === 'success' && (
          <>
            <TabBar tabs={sectionTabs} activeKey={activeSectionCode} onChange={changeSection} />

            {/* pill 자리는 items가 null이어도 높이를 유지해서 아래 그리드가 안 튄다 */}
            <div className={styles.pillSlot}>
              {pills !== null && pills.length > 0 && (
                <TabBar tabs={pillTabs} activeKey={activePillId} onChange={changePill} />
              )}
            </div>

            {isSectionLoading || isDocumentsLoading ? (
              <p className={styles.status}>불러오는 중...</p>
            ) : documents.length === 0 ? (
              <p className={styles.empty}>해당 항목에 표시할 서류가 없습니다.</p>
            ) : (
              <div className={styles.grid}>
                {documents.map((doc) => {
                  const hasGroup = Array.isArray(doc.acceptedVariants) && doc.acceptedVariants.length > 0;
                  return (
                    <DocumentCard
                      key={doc.documentId}
                      icon="📄"
                      title={doc.title}
                      description={doc.description}
                      chip={doc.tag}
                      onClick={hasGroup ? () => setSelectedDocumentId(doc.documentId) : undefined}
                    />
                  );
                })}
              </div>
            )}
          </>
        )
      )}

      <Modal isOpen={selectedDocumentId != null} onClose={() => setSelectedDocumentId(null)}>
        {selectedDocument && (
          <div className={styles.detail}>
            <h2 className={styles.detailTitle}>{selectedDocument.title}</h2>
            {selectedDocument.description && (
              <p className={styles.detailDescription}>{selectedDocument.description}</p>
            )}
            <h3 className={styles.detailSubtitle}>실제 준비 서류</h3>
            <ul className={styles.variantList}>
              {selectedDocument.acceptedVariants.map((variant) => (
                <li key={variant} className={styles.variantItem}>
                  <span className={styles.variantDot} />
                  {variant}
                </li>
              ))}
            </ul>
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
