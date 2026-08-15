import TabBar from '../../../../components/common/TabBar/TabBar.jsx';
import styles from './ChecklistPanel.module.css';

export default function ChecklistPanel({
  sections,
  documents,
  activeSectionCode,
  activeDocumentId,
  onChangeSection,
  onToggleReady,
  onConsult,
}) {
  const readyCount = documents.filter((doc) => doc.ready).length;
  const tabs = sections.map((section) => ({
    key: section.sectionCode,
    label: section.label,
    count: documents.filter((doc) => doc.sectionCode === section.sectionCode).length,
  }));
  const visibleDocuments = documents.filter((doc) => doc.sectionCode === activeSectionCode);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <p className={styles.headerTitle}>
          전체 서류 목록{' '}
          <span className={styles.headerCount}>
            {documents.length}건 · {sections.length}개 분류
          </span>
        </p>
        <div className={styles.readySummary}>
          <p className={styles.readyLabel}>준비완료</p>
          <p className={styles.readyValue}>
            {readyCount}/{documents.length}
          </p>
        </div>
      </div>

      <div className={styles.tabBarWrapper}>
        <TabBar tabs={tabs} activeKey={activeSectionCode} onChange={onChangeSection} />
      </div>

      <div className={styles.list}>
        {visibleDocuments.length === 0 ? (
          <p className={styles.empty}>해당 분류에 서류가 없습니다.</p>
        ) : (
          visibleDocuments.map((doc) => (
            <div key={doc.id} className={styles.item}>
              <div className={styles.itemMain}>
                <div>
                  <p className={styles.itemTitle}>{doc.title}</p>
                  <p className={styles.itemDescription}>
                    {doc.description}
                    {doc.ready && ' · 준비완료'}
                  </p>
                </div>
              </div>
              <div className={styles.itemActions}>
                <button
                  type="button"
                  className={`${styles.consultButton} ${
                    activeDocumentId === doc.id ? styles.consultButtonActive : ''
                  }`}
                  onClick={() => onConsult(doc)}
                >
                  {activeDocumentId === doc.id ? '상담중' : '상담'}
                </button>
                <button
                  type="button"
                  className={`${styles.completeButton} ${doc.ready ? styles.completeButtonActive : ''}`}
                  onClick={() => onToggleReady(doc.id)}
                  aria-pressed={doc.ready}
                >
                  {doc.ready ? '✓ 완료' : '완료'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
