import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FaCircleCheck, FaFileLines } from 'react-icons/fa6';
import { Link, useParams } from 'react-router-dom';
import AnalyzingModal from '../../components/checklist/AnalyzingModal/AnalyzingModal.jsx';
import OcrConfirmModal from '../../components/checklist/OcrConfirmModal/OcrConfirmModal.jsx';
import QuestionModal from '../../components/checklist/QuestionModal/QuestionModal.jsx';
import Button from '../../components/common/Button/Button.jsx';
import DocumentCard from '../../components/common/DocumentCard/DocumentCard.jsx';
import Modal from '../../components/common/Modal/Modal.jsx';
import TabBar from '../../components/common/TabBar/TabBar.jsx';
import { GUARANTEE_THEME, PRODUCT_ROUTE_TO_CODE } from '../../constants/products.js';
import { useContractUpload } from '../../hooks/useContractUpload.js';
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

export default function ProductChecklistPage() {
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
  } = useContractUpload(productCode);

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
    <motion.div
      className={styles.root}
      data-theme={theme}
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0.3 : 1, ease: ENTRY_EASE }}
    >
      <p className={styles.eyebrow}>
        <Link to="/guarantee-checklist">보증가입 체크리스트</Link>
        <span aria-hidden="true">/</span>
        <span>준비물 확인</span>
      </p>
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
        <FinalDocumentList
          sections={finalDocuments.sections}
          documents={finalDocuments.documents}
        />
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
                {documents.map((doc, index) => (
                    <motion.div
                      key={doc.documentId}
                      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: prefersReducedMotion ? 0.25 : 1,
                        delay: prefersReducedMotion ? 0 : index * 0.04,
                        ease: ENTRY_EASE,
                      }}
                    >
                      <DocumentCard
                        icon={<FaFileLines aria-hidden="true" />}
                        title={doc.title}
                        description={doc.description}
                        chip={doc.tag}
                        onClick={() => setSelectedDocumentId(doc.documentId)}
                      />
                    </motion.div>
                ))}
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
            {Array.isArray(selectedDocument.acceptedVariants) && selectedDocument.acceptedVariants.length > 0 ? (
              <ul className={styles.variantList}>
                {selectedDocument.acceptedVariants.map((variant) => (
                  <li key={variant} className={styles.variantItem}>
                    <span className={styles.variantDot} />
                    {variant}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.detailDescription}>
                이 서류는 별도 대체 서류 목록이 없습니다. 발급 가능한 원본 서류를 준비해주세요.
              </p>
            )}
            {selectedDocument.sampleImageUrl && (
              <img
                className={styles.sampleImage}
                src={selectedDocument.sampleImageUrl}
                alt={`${selectedDocument.title} 예시`}
              />
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
    </motion.div>
  );
}
