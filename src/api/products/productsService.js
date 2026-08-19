import axiosInstance from '../axiosInstance.js';

function normalizeDocuments(documents) {
  return [...documents]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((document) => ({
      documentId: document.documentId,
      title: document.documentName,
      description: document.description,
      sampleImageUrl: document.sampleImageUrl,
      sortOrder: document.sortOrder,
      documentGroupId: document.documentGroupId,
      documentGroupName: document.documentGroupName,
      documentGroupSortOrder: document.documentGroupSortOrder,
    }));
}

/**
 * 상품 체크리스트 중 특정 섹션만 조회한다.
 * @param {string} productCode - 상품 코드
 * @param {string} sectionCode - 섹션 코드
 * @returns {Promise<object|null>} 섹션 체크리스트 데이터
 */
export async function getChecklistBySection(productCode, sectionCode) {
  const res = await axiosInstance.get(`/api/products/${productCode}/checklist`, {
    params: { sectionCode },
  });
  return res.data;
}

/**
 * 체크리스트 item 하나에 속한 실제 서류 목록을 조회한다.
 * @param {string} productCode - 상품 코드
 * @param {number|string} itemId - 체크리스트 item ID
 * @returns {Promise<object[]>} 화면에서 사용하는 서류 목록
 */
export async function getItemDocuments(productCode, itemId) {
  const res = await axiosInstance.get(
    `/api/products/${productCode}/checklist/items/${itemId}/documents`,
  );

  return normalizeDocuments(res.data.documents ?? []);
}
