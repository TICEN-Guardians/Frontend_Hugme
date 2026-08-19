import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FaCheck, FaChevronDown, FaChevronUp } from 'react-icons/fa6';
import TabBar from '../../../../components/common/TabBar/TabBar.jsx';
import styles from './ChecklistPanel.module.css';

const DOCUMENT_CHAT_TRANSITION = {
  duration: 1.25,
  ease: [0.16, 1, 0.3, 1],
};
const QUICK_INTERACTION = {
  duration: 0.2,
  ease: 'easeOut',
};
const SECTION_TRANSITION = {
  duration: 0.22,
  ease: 'easeOut',
};

export default function ChecklistPanel({
  sections,
  documents,
  totalDocumentCount,
  preparedDocumentCount,
  activeSectionCode,
  expandedDocumentId,
  selectedDocumentId,
  onChangeSection,
  onTogglePrepared,
  onToggleExpanded,
  onSelectVariant,
  onSelectDocument,
  isUpdating,
}) {
  const prefersReducedMotion = useReducedMotion();
  const resolvedTotalDocumentCount = totalDocumentCount ?? documents.length;
  const resolvedPreparedDocumentCount =
    preparedDocumentCount ?? documents.filter((document) => document.prepared).length;
  const tabs = sections.map((section) => ({
    key: section.sectionCode,
    label: section.label,
    count:
      section.documents?.length ??
      documents.filter((document) => document.sectionCode === section.sectionCode).length,
  }));
  const visibleDocuments = documents.filter((document) => document.sectionCode === activeSectionCode);

  return (
    <motion.div
      className={styles.panel}
      initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : DOCUMENT_CHAT_TRANSITION}
    >
      <div className={styles.header}>
        <p className={styles.headerTitle}>
          전체 서류 목록{' '}
          <span className={styles.headerCount}>
            {resolvedTotalDocumentCount}건 · {sections.length}개 분류
          </span>
        </p>
        <div className={styles.readySummary}>
          <p className={styles.readyLabel}>준비완료</p>
          <p className={styles.readyValue}>
            {resolvedPreparedDocumentCount}/{resolvedTotalDocumentCount}
          </p>
        </div>
      </div>

      <div className={styles.tabBarWrapper}>
        <TabBar tabs={tabs} activeKey={activeSectionCode} onChange={onChangeSection} />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeSectionCode}
          className={styles.list}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -4 }}
          transition={prefersReducedMotion ? { duration: 0 } : SECTION_TRANSITION}
        >
          {visibleDocuments.length === 0 ? (
            <p className={styles.empty}>해당 분류에 서류가 없습니다.</p>
          ) : (
            visibleDocuments.map((document) => {
              const isExpanded = expandedDocumentId === document.documentId;
              const hasVariants = Array.isArray(document.selectableVariants) && document.selectableVariants.length > 0;
              const isDocumentSelected = selectedDocumentId === document.documentId;

              return (
                <motion.article
                  key={document.documentId}
                  className={`${styles.item} ${document.prepared ? styles.itemPrepared : ''} ${
                    isDocumentSelected ? styles.itemSelected : ''
                  } ${
                    isExpanded ? styles.itemExpanded : ''
                  }`}
                  layout
                  transition={prefersReducedMotion ? { duration: 0 } : DOCUMENT_CHAT_TRANSITION}
                >
                  <div className={styles.itemHeader}>
                    <motion.button
                      type="button"
                      className={`${styles.checkbox} ${document.prepared ? styles.checkboxChecked : ''}`}
                      onClick={() => onTogglePrepared(document)}
                      disabled={isUpdating}
                      role="checkbox"
                      aria-checked={document.prepared}
                      aria-label={`${document.documentName} 준비완료`}
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
                      transition={QUICK_INTERACTION}
                    >
                      {document.prepared && <FaCheck aria-hidden="true" />}
                    </motion.button>
                    <button
                      type="button"
                      className={styles.itemTextButton}
                      onClick={() => onSelectDocument(document.documentId)}
                    >
                      <p className={styles.itemTitle}>{document.documentName}</p>
                      <p className={styles.itemDescription}>
                        {document.description}
                        {document.prepared && ' · 준비완료'}
                      </p>
                    </button>
                    {isDocumentSelected && (
                      <span className={`${styles.selectedLabel} ${styles.documentSelectedLabel}`}>선택됨</span>
                    )}
                    {hasVariants && (
                      <button
                        type="button"
                        className={styles.expandButton}
                        onClick={() => onToggleExpanded(document.documentId)}
                        aria-expanded={isExpanded}
                      >
                        더보기
                        {isExpanded ? (
                          <FaChevronUp aria-label="접기" />
                        ) : (
                          <FaChevronDown aria-hidden="true" />
                        )}
                      </button>
                    )}
                  </div>
                  <AnimatePresence initial={false}>
                    {isExpanded && hasVariants && (
                      <motion.div
                        className={styles.variantPanel}
                        initial={{ opacity: 0, height: 0, y: prefersReducedMotion ? 0 : -8 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: prefersReducedMotion ? 0 : -8 }}
                        transition={prefersReducedMotion ? { duration: 0 } : DOCUMENT_CHAT_TRANSITION}
                      >
                        <p className={styles.variantTitle}>내 상황에 맞는 계약서 종류를 선택하세요</p>
                        <div className={styles.variantList}>
                          {document.selectableVariants.map((variant, index) => {
                            const isSavedVariant = document.selectedVariantId === variant.variantId;
                            const isSelected = isDocumentSelected && isSavedVariant;

                            return (
                              <motion.label
                                key={variant.variantId}
                                className={`${styles.variantOption} ${
                                  isSelected ? styles.variantOptionSelected : ''
                                }`}
                                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={
                                  prefersReducedMotion
                                    ? { duration: 0 }
                                    : {
                                        ...DOCUMENT_CHAT_TRANSITION,
                                        delay: index * 0.04,
                                      }
                                }
                              >
                                <input
                                  type="radio"
                                  name={`document-${document.documentId}-variant`}
                                  checked={isSavedVariant}
                                  onChange={() => onSelectVariant(document.documentId, variant.variantId)}
                                />
                                <span className={styles.radioMark} aria-hidden="true" />
                                <span className={styles.variantText}>
                                  <span className={styles.variantName}>{variant.title}</span>
                                  <span className={styles.variantDescription}>{variant.description}</span>
                                </span>
                                {isSelected && <span className={styles.selectedLabel}>선택됨</span>}
                              </motion.label>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
