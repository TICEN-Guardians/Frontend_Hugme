import { useCallback, useEffect, useState } from 'react';
import {
  getChecklistBySection,
  getItemDocuments,
} from '../services/products/productsService.js';

const SECTION_CODES = ['BASIC', 'ADDITIONAL', 'DISCOUNT'];

/**
 * 상품 체크리스트 화면의 데이터 fetch를 담당한다.
 * 섹션(1단계 탭) → pill(2단계, items가 null이 아닐 때만) → 서류 목록 순으로 조회한다.
 * @param {string} productCode - 상품 코드
 */
export function useProductChecklist(productCode) {
  const [sections, setSections] = useState([]);
  const [activeSectionCode, setActiveSectionCode] = useState(null);

  const [pills, setPills] = useState([]);
  const [activePillId, setActivePillId] = useState(null);

  const [documents, setDocuments] = useState([]);

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [error, setError] = useState(null);
  const [isSectionLoading, setIsSectionLoading] = useState(false);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState(null);

  const loadPillDocuments = useCallback(
    (itemId) => {
      setIsDocumentsLoading(true);
      setDocumentsError(null);
      getItemDocuments(productCode, itemId)
        .then((result) => setDocuments(Array.isArray(result) ? result : []))
        .catch((err) => setDocumentsError(err))
        .finally(() => setIsDocumentsLoading(false));
    },
    [productCode],
  );

  const applySection = useCallback(
    (section) => {
      setActiveSectionCode(section?.sectionCode ?? null);

      const nextPills = section?.items ?? [];
      setPills(nextPills);

      if (nextPills.length === 0) {
        setActivePillId(null);
        setDocuments(section?.documents ?? []);
        return;
      }

      const firstPill = nextPills[0];
      setActivePillId(firstPill.itemId);
      loadPillDocuments(firstPill.itemId);
    },
    [loadPillDocuments],
  );

  useEffect(() => {
    let ignore = false;
    setStatus('loading');
    setError(null);

    Promise.all(SECTION_CODES.map((sectionCode) => getChecklistBySection(productCode, sectionCode)))
      .then((data) => {
        if (ignore) return;
        const nextSections = data.filter(Boolean);
        setSections(nextSections);
        applySection(nextSections[0] ?? null);
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
    (sectionCode) => {
      setIsSectionLoading(true);
      getChecklistBySection(productCode, sectionCode)
        .then((section) => applySection(section))
        .catch((err) => {
          setError(err);
          setStatus('error');
        })
        .finally(() => setIsSectionLoading(false));
    },
    [productCode, applySection],
  );

  const changePill = useCallback(
    (itemId) => {
      setActivePillId(itemId);
      loadPillDocuments(itemId);
    },
    [loadPillDocuments],
  );

  return {
    sections,
    activeSectionCode,
    pills,
    activePillId,
    documents,
    status,
    error,
    isSectionLoading,
    isDocumentsLoading,
    documentsError,
    changeSection,
    changePill,
  };
}
