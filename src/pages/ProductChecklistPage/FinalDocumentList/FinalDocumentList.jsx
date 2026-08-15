import { useState } from 'react';
import DocumentCard from '../../../components/common/DocumentCard/DocumentCard.jsx';
import TabBar from '../../../components/common/TabBar/TabBar.jsx';
import styles from './FinalDocumentList.module.css';

/**
 * 질문 완료 후 확정된 서류 목록. 6차의 group pill/Item 계층 없이,
 * 섹션 탭 → Document 카드가 바로 그리드에 펼쳐지는 구조.
 * 카드는 acceptedVariants가 배열일 때만(확장형) 클릭 시 인라인으로 펼쳐진다.
 */
export default function FinalDocumentList({ sections, documents }) {
  const [activeSectionCode, setActiveSectionCode] = useState(sections[0]?.sectionCode ?? null);
  const [expandedDocumentId, setExpandedDocumentId] = useState(null);

  const sectionTabs = sections.map((section) => ({
    key: section.sectionCode,
    label: section.sectionTitle,
    count: documents.filter((doc) => doc.sectionCode === section.sectionCode).length,
  }));

  const visibleDocuments = documents.filter((doc) => doc.sectionCode === activeSectionCode);

  const toggleExpand = (documentId) => {
    setExpandedDocumentId((prev) => (prev === documentId ? null : documentId));
  };

  return (
    <div>
      <TabBar tabs={sectionTabs} activeKey={activeSectionCode} onChange={setActiveSectionCode} />

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatchAccent} />
          제출 확정
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatchNeutral} />
          해당 없음
        </span>
      </div>

      {visibleDocuments.length === 0 ? (
        <p className={styles.empty}>해당 섹션에 확정된 서류가 없습니다.</p>
      ) : (
        <div className={styles.grid}>
          {visibleDocuments.map((doc) => {
            const hasGroup = Array.isArray(doc.acceptedVariants) && doc.acceptedVariants.length > 0;
            const isExpanded = expandedDocumentId === doc.documentId;
            return (
              <div key={doc.documentId} className={styles.itemWrapper}>
                <DocumentCard
                  icon="📄"
                  title={doc.title}
                  description={doc.description}
                  chip={doc.tag}
                  status={doc.status}
                  expanded={hasGroup ? isExpanded : undefined}
                  onClick={hasGroup ? () => toggleExpand(doc.documentId) : undefined}
                />
                {hasGroup && isExpanded && (
                  <ul className={styles.variantList}>
                    {doc.acceptedVariants.map((variant) => (
                      <li key={variant} className={styles.variantItem}>
                        <span className={styles.variantDot} />
                        {variant}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
