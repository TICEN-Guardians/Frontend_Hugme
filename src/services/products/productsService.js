import axiosInstance from '../../api/axiosInstance.js';
import { mockChecklistByProduct, mockItemDocuments } from '../../mocks/products.mock.js';

const isMock = () => import.meta.env.VITE_USE_MOCK === 'true';

/**
 * 상품의 전체 체크리스트를 조회한다.
 * @param {string} productCode - 상품 코드 (PRODUCT_CODES 참고)
 * @returns {Promise<object>} 체크리스트 데이터
 */
export async function getChecklist(productCode) {
  if (isMock()) {
    return Promise.resolve(mockChecklistByProduct[productCode] ?? null);
  }
  const res = await axiosInstance.get(`/api/products/${productCode}/checklist`);
  return res.data;
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
  return res.data;
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
  return res.data;
}
