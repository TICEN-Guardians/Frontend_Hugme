import axiosInstance from '../../api/axiosInstance.js';
import { mockChecklistByProduct, mockItemDocuments } from '../../mocks/products.mock.js';

const isMock = () => import.meta.env.VITE_USE_MOCK === 'true';

const SECTION_TITLES = {
  BASIC: '기본서류',
  ADDITIONAL: '추가서류',
  DISCOUNT: '보증료 할인서류',
};

function normalizeItem(item) {
  return {
    itemId: item.itemId,
    label: item.itemName ?? item.label ?? item.groupName ?? '준비 항목',
    sortOrder: item.sortOrder ?? item.groupSortOrder ?? 0,
    groupId: item.groupId ?? null,
    groupName: item.groupName ?? null,
  };
}

function normalizeDocument(document) {
  return {
    documentId: document.documentId,
    title: document.documentName ?? document.title,
    description: document.description ?? null,
    tag: document.documentGroupName ?? document.tag ?? '서류',
    sampleImageUrl: document.sampleImageUrl ?? null,
    acceptedVariants: document.acceptedVariants ?? null,
  };
}

function normalizeSection(section) {
  const items = (section?.items ?? []).map(normalizeItem);
  return {
    productCode: section?.productCode,
    sectionCode: section?.sectionCode,
    sectionTitle: section?.sectionName ?? section?.sectionTitle ?? SECTION_TITLES[section?.sectionCode] ?? '서류',
    documentCount: items.length,
    items,
    documents: null,
  };
}

/**
 * 상품 체크리스트 중 특정 섹션만 조회한다.
 * @param {string} productCode - 상품 코드
 * @param {string} sectionCode - 섹션 코드
 * @returns {Promise<object|null>} 섹션 체크리스트 데이터
 */
export async function getChecklistBySection(productCode, sectionCode) {
  if (isMock()) {
    const checklist = mockChecklistByProduct[productCode];
    const section = checklist?.sections.find((item) => item.sectionCode === sectionCode) ?? null;
    return Promise.resolve(section);
  }
  const res = await axiosInstance.get(`/api/products/${productCode}/checklist`, {
    params: { sectionCode },
  });
  return normalizeSection(res.data);
}

/**
 * pill(item) 하나에 속한 서류 목록을 조회한다. section.items가 배열일 때만 사용한다.
 * @param {string} productCode - 상품 코드
 * @param {string} itemId - pill(item) ID
 * @returns {Promise<object[]>} 서류 목록 (각 서류는 acceptedVariants 포함)
 */
export async function getItemDocuments(productCode, itemId) {
  if (isMock()) {
    return Promise.resolve(mockItemDocuments[itemId] ?? []);
  }
  const res = await axiosInstance.get(
    `/api/products/${productCode}/checklist/items/${itemId}/documents`,
  );
  return (res.data?.documents ?? []).map(normalizeDocument);
}
