import axiosInstance from '../../api/axiosInstance.js';
import {
  mockApplication,
  mockApplicationInfo,
  mockDocuments,
  mockQuestionsByStep,
  mockSubmitAnswers,
  mockUploadResponse,
} from '../../mocks/checklist.mock.js';

const isMock = () => import.meta.env.VITE_USE_MOCK === 'true';

/**
 * 새 보증 신청 건을 생성한다.
 * @returns {Promise<object>} 생성된 신청 정보
 */
export async function createApplication() {
  if (isMock()) {
    return Promise.resolve(mockApplication);
  }
  const res = await axiosInstance.post('/api/applications');
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
 * 한 step의 답변을 전부 제출한다. 다음 step 결정은 서버 몫이라
 * 클라이언트는 이 함수의 반환값(done / questionStep / questions)만 보고 따라간다.
 *
 * 응답 스키마 미확정 지점: POST /answers 응답에 다음 step 정보가 같이 오는지(A),
 * 아니면 성공 여부만 오고 별도로 GET /questions를 다시 불러야 하는지(B) 확인이 필요하다.
 * 일단 (A)로 구현했고, 실제로 (B)로 밝혀져도 이 함수 내부만 고치면
 * 화면/훅 쪽 코드는 안 바뀌도록 반환 형태를 통일해뒀다.
 *
 * @param {number|string} applicationId - 신청 ID
 * @param {string} currentStep - 이번에 제출하는 질문 단계
 * @param {number[]} selectedOptionIds - 이 step의 질문마다 하나씩 고른 optionId 배열
 * @param {boolean} finalSubmission - 이 step이 마지막이면 true
 * @returns {Promise<{done: boolean, questionStep: string|null, questions: object[]|null, isFinalStep: boolean}>}
 */
export async function submitAnswers(applicationId, currentStep, selectedOptionIds, finalSubmission) {
  if (isMock()) {
    return Promise.resolve(mockSubmitAnswers(currentStep));
  }

  const res = await axiosInstance.post(`/api/applications/${applicationId}/answers`, {
    currentStep,
    finalSubmission,
    selectedOptionIds,
  });

  // (A) 가정: 응답에 다음 questionStep/questions가 함께 온다고 보고 감싼다.
  const data = res.data;
  if (finalSubmission || !data?.questionStep) {
    return { done: true, questionStep: null, questions: null, isFinalStep: true };
  }
  return {
    done: false,
    questionStep: data.questionStep,
    questions: data.questions,
    isFinalStep: data.isFinalStep ?? false,
  };
}

/**
 * 신청 건에 첨부된 서류 목록을 조회한다.
 * @param {number|string} applicationId - 신청 ID
 * @returns {Promise<object[]>} 서류 목록
 */
export async function getDocuments(applicationId) {
  if (isMock()) {
    return Promise.resolve(mockDocuments);
  }
  const res = await axiosInstance.get(`/api/applications/${applicationId}/documents`);
  return res.data;
}
