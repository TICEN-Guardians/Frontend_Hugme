import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaChevronRight, FaCircleInfo, FaFileLines } from 'react-icons/fa6';
import TabBar from '../../../components/common/TabBar/TabBar.jsx';
import pageStyles from '../ProductChecklistPage.module.css';
import styles from './FinalDocumentList.module.css';

const PANEL_EASE = [0.22, 1, 0.36, 1];
const SELECTOR_STAGGER = 0.035;

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
        documents: [],
      };
      groupsById.set(document.documentGroupId, group);
      entries.push(group);
    }

    groupsById.get(document.documentGroupId).documents.push(document);
  });

  return entries;
}

export default function FinalDocumentList({ result }) {
  const sections = result?.sections ?? [];

  const [activeSectionCode, setActiveSectionCode] = useState(
    sections[0]?.sectionCode ?? null,
  );
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [expandedDocumentGroupIds, setExpandedDocumentGroupIds] = useState([]);

  const activeSection =
    sections.find(
      (section) => section.sectionCode === activeSectionCode,
    ) ?? sections[0] ??
    null;

  const sectionItems = activeSection?.items ?? [];

  const groups = useMemo(() => {
    const groupMap = new Map();

    sectionItems.forEach((item) => {
      if (item.groupId == null) return;

      if (!groupMap.has(item.groupId)) {
        groupMap.set(item.groupId, {
          groupId: item.groupId,
          groupName: item.groupName,
          groupSortOrder: item.groupSortOrder,
        });
      }
    });

    return [...groupMap.values()].sort(
      (a, b) =>
        (a.groupSortOrder ?? 0) -
        (b.groupSortOrder ?? 0),
    );
  }, [sectionItems]);

  // 아직 선택된 그룹이 없다면 첫 번째 그룹 사용
  const currentGroupId =
    activeGroupId ?? groups[0]?.groupId ?? null;

  const visibleItems =
    groups.length > 0
      ? sectionItems.filter(
          (item) => item.groupId === currentGroupId,
        )
      : sectionItems;

  const selectedItem =
    sectionItems.find(
      (item) => item.itemId === selectedItemId,
    ) ?? null;
  const modalDocumentEntries = groupModalDocuments(selectedItem?.documents ?? []);

  const sectionTabs = sections.map((section) => ({
    key: section.sectionCode,
    label: section.sectionName,
    count: section.items?.length ?? 0,
  }));

  const groupTabs = groups.map((group) => ({
    key: group.groupId,
    label: group.groupName,
  }));

  const handleSectionChange = (sectionCode) => {
    const nextSection = sections.find(
      (section) => section.sectionCode === sectionCode,
    );

    const firstGroupedItem = nextSection?.items?.find(
      (item) => item.groupId != null,
    );

    setActiveSectionCode(sectionCode);
    setActiveGroupId(firstGroupedItem?.groupId ?? null);
    setSelectedItemId(null);
    setExpandedDocumentGroupIds([]);
  };

  const toggleDocumentGroup = (groupId) => {
    setExpandedDocumentGroupIds((current) =>
      current.includes(groupId)
        ? current.filter((currentGroupId) => currentGroupId !== groupId)
        : [...current, groupId],
    );
  };

  useEffect(() => {
    if (visibleItems.length === 0) {
      setSelectedItemId(null);
      setExpandedDocumentGroupIds([]);
      return;
    }

    if (selectedItemId != null && visibleItems.some((item) => item.itemId === selectedItemId)) {
      return;
    }

    setSelectedItemId(visibleItems[0].itemId);
    setExpandedDocumentGroupIds([]);
  }, [visibleItems, selectedItemId]);

  if (sections.length === 0) {
    return (
      <p className={styles.empty}>
        확정된 제출 서류가 없습니다.
      </p>
    );
  }

  return (
    <div>
      <TabBar
        tabs={sectionTabs}
        activeKey={activeSection?.sectionCode}
        onChange={handleSectionChange}
      />

      <div className={pageStyles.itemArea}>
        {visibleItems.length === 0 ? (
          <p className={pageStyles.empty}>확정된 제출 서류가 없습니다.</p>
        ) : (
          <div className={pageStyles.checklistLayout}>
            <div className={pageStyles.selectorPanel}>
              {groupTabs.length > 0 && (
                <div className={pageStyles.groupFilterRow} aria-label="추가서류 분류">
                  {groupTabs.map((group) => (
                    <button
                      key={group.key}
                      type="button"
                      className={pageStyles.groupFilterButton}
                      data-selected={group.key === currentGroupId}
                      onClick={() => setActiveGroupId(group.key)}
                    >
                      {group.label}
                    </button>
                  ))}
                </div>
              )}
              <motion.div
                className={pageStyles.documentList}
                variants={selectorListVariants}
                initial="hidden"
                animate="visible"
              >
                {visibleItems.map((item) => {
                  const isSelected = item.itemId === selectedItemId;
                  return (
                    <motion.button
                      key={item.itemId}
                      type="button"
                      className={pageStyles.selectorButton}
                      data-selected={isSelected}
                      aria-pressed={isSelected}
                      onClick={() => {
                        setExpandedDocumentGroupIds([]);
                        setSelectedItemId(item.itemId);
                      }}
                      variants={selectorItemVariants}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.995 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      <FaFileLines className={pageStyles.selectorIcon} aria-hidden="true" />
                      <span className={pageStyles.selectorTitle}>{item.itemName}</span>
                      <FaChevronRight className={pageStyles.selectorChevron} aria-hidden="true" />
                    </motion.button>
                  );
                })}
              </motion.div>
            </div>

            <section className={pageStyles.detailPanel} aria-live="polite">
              <AnimatePresence mode="wait">
                {selectedItem ? (
                  <motion.div
                    key={selectedItem.itemId}
                    className={pageStyles.detailContent}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.5, ease: PANEL_EASE }}
                  >
                    <p className={pageStyles.previewEyebrow}>선택한 서류</p>
                    <h2 className={pageStyles.detailTitle}>{selectedItem.itemName}</h2>

                    <div className={pageStyles.detailSection}>
                      <h3 className={pageStyles.detailSubtitle}>실제 준비 서류</h3>
                      <div className={pageStyles.variantGrid}>
                        {modalDocumentEntries.map((entry) => {
                          if (entry.type === 'document') {
                            const { document } = entry;
                            return (
                              <div key={entry.key} className={pageStyles.variantItem}>
                                <span className={pageStyles.variantDot} />
                                <div>
                                  <strong>{document.documentName}</strong>
                                  {document.description && <p>{document.description}</p>}
                                  {Array.isArray(document.acceptedVariants) &&
                                    document.acceptedVariants.length > 0 && (
                                      <div className={pageStyles.acceptedVariantList}>
                                        {document.acceptedVariants.map((variant) => (
                                          <span key={variant} className={pageStyles.acceptedVariant}>
                                            <span className={pageStyles.variantDot} />
                                            {variant}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div key={entry.key} className={pageStyles.documentGroup}>
                              <div className={pageStyles.groupSummary}>
                                <span>{entry.groupName}</span>
                                <small>{entry.documents.length}개</small>
                              </div>
                              <div className={pageStyles.inlineDocumentList}>
                                {entry.documents.map((document) => (
                                  <div
                                    key={document.documentId}
                                    className={pageStyles.inlineDocument}
                                  >
                                    <span className={pageStyles.variantDot} />
                                    <div>
                                      <strong>{document.documentName}</strong>
                                      {document.description && <p>{document.description}</p>}
                                      {Array.isArray(document.acceptedVariants) &&
                                        document.acceptedVariants.length > 0 && (
                                          <div className={pageStyles.acceptedVariantList}>
                                            {document.acceptedVariants.map((variant) => (
                                              <span key={variant} className={pageStyles.acceptedVariant}>
                                                <span className={pageStyles.variantDot} />
                                                {variant}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    className={pageStyles.previewEmpty}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.5, ease: PANEL_EASE }}
                  >
                    <FaCircleInfo className={pageStyles.previewIcon} aria-hidden="true" />
                    <h2>서류를 선택해 주세요</h2>
                    <p>왼쪽 목록에서 서류를 선택하면 상세정보를 확인할 수 있어요.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
