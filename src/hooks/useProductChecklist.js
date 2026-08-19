import { useCallback, useEffect, useState } from 'react';
import {
  getChecklistBySection,
  getItemDocuments,
} from '../services/products/productsService.js';


const DEFAULT_SECTION_CODE = 'BASIC';

const CHECKLIST_SECTIONS = [
  { sectionCode: 'BASIC', sectionTitle: '기본서류' },
  { sectionCode: 'ADDITIONAL', sectionTitle: '추가서류' },
  { sectionCode: 'DISCOUNT', sectionTitle: '보증료 할인 서류' },
];

function sortItems(items) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

function groupItems(items) {
  const grouped = new Map();

  items.forEach((item) => {
    if (item.groupId == null || !item.groupName) return;

    if (!grouped.has(item.groupId)) {
      grouped.set(item.groupId, {
        groupId: item.groupId,
        groupName: item.groupName,
        groupSortOrder: item.groupSortOrder,
        items: [],
      });
    }
    grouped.get(item.groupId).items.push(item);
  });

  return [...grouped.values()]
    .sort((a, b) => a.groupSortOrder - b.groupSortOrder)
    .map((group) => ({ ...group, items: sortItems(group.items) }));
}

/** section → group → item → documents 흐름을 관리한다. */
export function useProductChecklist(productCode) {
  const [activeSectionCode, setActiveSectionCode] = useState(DEFAULT_SECTION_CODE);
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [items, setItems] = useState([]);
  const [activeItemId, setActiveItemId] = useState(null);

  const [documents, setDocuments] = useState([]);

  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [isSectionLoading, setIsSectionLoading] = useState(false);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState(null);

  const loadItemDocuments = useCallback(
    async (itemId) => {
      setActiveItemId(itemId);
      setIsDocumentsLoading(true);
      setDocumentsError(null);

      setDocuments([]);

      try {
        const nextDocuments = await getItemDocuments(productCode, itemId);
        setDocuments(Array.isArray(nextDocuments) ? nextDocuments : []);
      } catch (err) {
        setDocumentsError(err);
        setDocuments([]);
      } finally {
        setIsDocumentsLoading(false);
      }

    },
    [productCode],
  );

  const applySection = useCallback(
    (section) => {
      const sectionItems = sortItems(section?.items ?? []);
      const nextGroups = groupItems(sectionItems);
      const nextItems = nextGroups.length > 0 ? nextGroups[0].items : sectionItems;


      setActiveSectionCode(section?.sectionCode ?? DEFAULT_SECTION_CODE);
      setGroups(nextGroups);
      setActiveGroupId(nextGroups[0]?.groupId ?? null);
      setItems(nextItems);
      setActiveItemId(null);
      setDocuments([]);
    },
    [],
  );

  useEffect(() => {
    let ignore = false;
    setStatus('loading');
    setError(null);


    getChecklistBySection(productCode, DEFAULT_SECTION_CODE)
      .then((section) => {
        if (ignore) return;
        applySection(section);

        setStatus('success');
      })
      .catch((err) => {
        if (ignore) return;
        setError(err);
        setStatus('error');
      });

    return () => {
      ignore = true;
    };
  }, [productCode, applySection]);

  const changeSection = useCallback(
    async (sectionCode) => {
      setIsSectionLoading(true);
      setError(null);

      try {
        const section = await getChecklistBySection(productCode, sectionCode);
        applySection(section);
        setStatus('success');
      } catch (err) {
        setError(err);
        setStatus('error');
      } finally {
        setIsSectionLoading(false);
      }
    },
    [productCode, applySection],
  );

  const changeGroup = useCallback(
    (groupId) => {
      const selectedGroup = groups.find((group) => group.groupId === groupId);
      const nextItems = selectedGroup?.items ?? [];

      setActiveGroupId(groupId);
      setItems(nextItems);
      setActiveItemId(null);
      setDocuments([]);
    },
    [groups],
  );

  return {
    sections: CHECKLIST_SECTIONS,
    activeSectionCode,
    groups,
    activeGroupId,
    items,
    activeItemId,
    documents,
    status,
    error,
    isSectionLoading,
    isDocumentsLoading,
    documentsError,
    changeSection,
    changeGroup,
    changeItem: loadItemDocuments,
  };
}
