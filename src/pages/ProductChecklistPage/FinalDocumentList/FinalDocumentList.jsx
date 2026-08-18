import { useMemo, useState } from 'react';
import { FaFileLines } from 'react-icons/fa6';
import DocumentCard from '../../../components/common/DocumentCard/DocumentCard.jsx';
import Modal from '../../../components/common/Modal/Modal.jsx';
import TabBar from '../../../components/common/TabBar/TabBar.jsx';
import pageStyles from '../ProductChecklistPage.module.css';
import styles from './FinalDocumentList.module.css';

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

  const closeItemModal = () => {
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

      <div className={pageStyles.pillSlot}>
        {groupTabs.length > 0 && (
          <TabBar
            tabs={groupTabs}
            activeKey={currentGroupId}
            onChange={setActiveGroupId}
            variant="pill"
          />
        )}
      </div>

      <div className={pageStyles.itemArea}>
        {visibleItems.length === 0 ? (
          <p className={pageStyles.empty}>확정된 제출 서류가 없습니다.</p>
        ) : (
          <div className={pageStyles.grid}>
            {visibleItems.map((item) => (
              <DocumentCard
                key={item.itemId}
                icon={<FaFileLines />}
                title={item.itemName}
                singleLine
                onClick={() => {
                  setExpandedDocumentGroupIds([]);
                  setSelectedItemId(item.itemId);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={selectedItemId != null}
        onClose={closeItemModal}
      >
        {selectedItem && (
          <div className={pageStyles.detail}>
            <h2 className={pageStyles.detailTitle}>{selectedItem.itemName}</h2>
            <h3 className={pageStyles.detailSubtitle}>실제 준비 서류</h3>

            <div className={pageStyles.modalDocumentList}>
              {modalDocumentEntries.map((entry) => {
                if (entry.type === 'document') {
                  const { document } = entry;
                  return (
                    <div key={entry.key} className={pageStyles.variantItem}>
                      <span className={pageStyles.variantDot} />
                      <div>
                        <strong>{document.documentName}</strong>
                        {document.description && <p>{document.description}</p>}
                      </div>
                    </div>
                  );
                }

                const isExpanded = expandedDocumentGroupIds.includes(entry.groupId);
                return (
                  <div key={entry.key} className={pageStyles.documentGroup}>
                    <DocumentCard
                      icon={<FaFileLines />}
                      title={entry.groupName}
                      description={`${entry.documents.length}개의 준비 서류`}
                      expanded={isExpanded}
                      onClick={() => toggleDocumentGroup(entry.groupId)}
                    />
                    {isExpanded && (
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
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
