import axiosInstance from '../../api/axiosInstance.js';
import {
  mockApplication,
  mockApplicationInfo,
  mockDocuments,
  mockQuestionsByStep,
  mockResultDocuments,
  mockSubmitAnswers,
  mockUploadResponse,
} from '../../mocks/checklist.mock.js';

const isMock = () => import.meta.env.VITE_USE_MOCK === 'true';

/**
 * 새 보증 신청 건을 생성한다.
 * @param {string} productCode - 신청할 상품 코드
 * @returns {Promise<object>} 생성된 신청 정보
 */
export async function createApplication(productCode) {
  if (isMock()) {
    return Promise.resolve({ ...mockApplication, productCode });
  }
  const res = await axiosInstance.post('/api/applications', { productCode });
  return res.data;
}

/**
 * 임대차계약서 파일을 업로드한다.
 * @param {number|string} applicationId - 신청 ID
 * @param {File} file - 업로드할 계약서 파일
 * @returns {Promise<object>} 업로드 결과
 */
export async function uploadLeaseContract(applicationId, file) {
  if (isMock()) {
    return Promise.resolve(mockUploadResponse);
  }
  const formData = new FormData();
  formData.append('file', file);
  const res = await axiosInstance.post(
    `/api/applications/${applicationId}/lease-contract`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return res.data;
}

/**
 * 신청 건의 입력 정보를 조회한다.
 * @param {number|string} applicationId - 신청 ID
 * @returns {Promise<object>} 신청 정보
 */
export async function getInfo(applicationId) {
  if (isMock()) {
    return Promise.resolve(mockApplicationInfo);
  }
  const res = await axiosInstance.get(`/api/applications/${applicationId}/info`);
  return res.data;
}

/**
 * 신청 건의 입력 정보를 수정한다.
 * @param {number|string} applicationId - 신청 ID
 * @param {object} data - 수정할 정보
 * @returns {Promise<object>} 수정된 정보
 */
export async function updateInfo(applicationId, data) {
  if (isMock()) {
    return Promise.resolve({ ...mockApplicationInfo, ...data });
  }
  const res = await axiosInstance.patch(`/api/applications/${applicationId}/info`, data);
  return res.data;
}

/**
 * 특정 단계의 질문 목록을 조회한다. 최초 진입(STEP1)에만 쓰고, 이후 단계는
 * submitAnswers()의 응답으로 진행한다 — step은 서버가 정하는 것이라 순차가 아니다.
 * @param {number|string} applicationId - 신청 ID
 * @param {string} questionStep - 질문 단계 (예: 'STEP1')
 * @returns {Promise<{questionStep: string, questions: object[], isFinalStep: boolean}>}
 */
export async function getQuestions(applicationId, questionStep) {
  if (isMock()) {
    return Promise.resolve(
      mockQuestionsByStep[questionStep] ?? {
        questionStep,
        questions: [],
        isFinalStep: true,
      },
    );
  }
  const res = await axiosInstance.get(`/api/applications/${applicationId}/questions`, {
    params: { step: questionStep },
  });
  return res.data;
}

/**
 * 한 step의 답변을 제출하고 서버가 결정한 다음 단계 질문을 반환한다.
 *
 * @param {number|string} applicationId - 신청 ID
 * @param {string} currentStep - 이번에 제출하는 질문 단계
 * @param {number[]} selectedOptionIds - 이 step의 질문마다 하나씩 고른 optionId 배열
 * @param {boolean} finalSubmission - 이 step이 마지막이면 true
 * @returns {Promise<{done: boolean, questionStep: string|null, questions: object[]|null, isFinalStep: boolean}>}
 */
export async function submitAnswers(applicationId, currentStep, selectedOptionIds, finalSubmission) {
  let data;

  if (isMock()) {
    data = mockSubmitAnswers(currentStep);
    console.log('[answers] mock request', {
      applicationId,
      currentStep,
      finalSubmission: Boolean(finalSubmission),
      selectedOptionIds,
    });
    console.log('[answers] mock response', data);
  } else {
    const requestBody = {
      currentStep,
      finalSubmission: Boolean(finalSubmission),
      selectedOptionIds,
    };

    console.log('[answers] request', {
      applicationId,
      body: requestBody,
    });

    const res = await axiosInstance.post(
      `/api/applications/${applicationId}/answers`,
      requestBody,
    );
    data = res.data;
    console.log('[answers] response', data);
  }

  if (data?.questionnaireCompleted) {
    return { done: true, questionStep: null, questions: null, isFinalStep: true };
  }

  const nextStep = data?.nextStep ?? null;
  const nextQuestions = data?.additionalQuestions;

  return {
    done: false,
    questionStep: nextStep,
    questions: Array.isArray(nextQuestions) ? nextQuestions : [],
    isFinalStep: nextStep != null && nextStep !== 'STEP1' && nextStep !== 'STEP2',
  };
}

/**
 * 신청 건에 첨부된 서류 목록을 조회한다.
 * @param {number|string} applicationId - 신청 ID
 * @returns {Promise<object[]>} 서류 목록
 */
export async function getDocuments(applicationId) {
  let data;

  if (isMock()) {
    data = mockDocuments;
  } else {
    const res = await axiosInstance.get(`/api/applications/${applicationId}/documents`);
    data = res.data;
  }

  const documents = Array.isArray(data) ? data : data?.documents ?? [];

  return documents.map((document) => ({
    ...document,
    title: document.title ?? document.documentName,
    tag: document.tag ?? document.documentGroupName ?? null,
    acceptedVariants: document.acceptedVariants ?? null,
  }));
}
/**
 * 질문 결과로 확정된 최종 서류 목록을 조회한다.
 *
 * @param {number|string} applicationId - 신청 ID
 * @returns {Promise<{
*   applicationId: number|string,
*   sections: Array<{
*     sectionCode: string,
*     sectionName: string,
*     items: Array<{
*       itemId: number|string,
*       itemName: string,
*       sortOrder: number,
*       defaultIncluded: boolean,
*       groupId: number|string|null,
*       groupName: string|null,
*       groupSortOrder: number|null,
*       documents: Array<object>
*     }>
*   }>
* }>}
*/
export async function getResultDocuments(applicationId) {
 if (isMock()) {
   return Promise.resolve(mockResultDocuments);
 }

 const res = await axiosInstance.get(
   `/api/applications/${applicationId}/result-documents`,
 );

 return res.data;
}
