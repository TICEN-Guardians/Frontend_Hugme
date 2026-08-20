import axiosInstance from '../axiosInstance.js';

function toYesNo(value) {
  if (value === true) return 'YES';
  if (value === false) return 'NO';
  return value ?? '';
}

function toBoolean(value) {
  if (value === 'YES') return true;
  if (value === 'NO') return false;
  return Boolean(value);
}

function normalizeOcrInfo(data) {
  return {
    ...data,
    housingType: data.housingTypeCode ?? data.housingType ?? '',
    contractType: data.contractType ?? '',
    tenantType: data.tenantType ?? '',
    landlordType: data.landlordType ?? '',
    fixedDateStatus:
      data.fixedDateStatus ?? (data.fixedDateConfirmed === true ? 'RECEIVED' : 'NOT_RECEIVED'),
    officetelResidential: data.officetelResidential ?? toYesNo(data.officetelResidentialMarked),
    landlordProxyContract: toYesNo(data.landlordProxyContract),
  };
}

function toOcrUpdateRequest(formValues) {
  return {
    housingTypeCode: formValues.housingTypeCode ?? formValues.housingType,
    contractAddress: formValues.contractAddress,
    contractType: formValues.contractType,
    tenantType: formValues.tenantType,
    landlordType: formValues.landlordType,
    fixedDateConfirmed:
      formValues.fixedDateConfirmed ?? formValues.fixedDateStatus === 'RECEIVED',
    officetelResidentialMarked:
      formValues.officetelResidentialMarked ?? toBoolean(formValues.officetelResidential),
    landlordProxyContract: toBoolean(formValues.landlordProxyContract),
  };
}

function normalizeQuestionResponse(data, fallbackStep = null) {
  const questionStep = data?.questionStep ?? data?.step ?? data?.nextStep ?? fallbackStep;
  const questions = data?.questions ?? data?.additionalQuestions ?? data?.nextQuestions ?? [];

  return {
    questionStep,
    questions: Array.isArray(questions) ? questions : [],
    isFinalStep:
      data?.isFinalStep ??
      data?.finalStep ??
      (questionStep != null && questionStep !== 'STEP1' && questionStep !== 'STEP2'),
  };
}

function isQuestionnaireDone(data) {
  return Boolean(
    data?.questionnaireCompleted ??
      data?.done ??
      data?.completed ??
      data?.isCompleted ??
      (data?.applicationStatus === 'DONE' || data?.status === 'DONE'),
  );
}

/**
 * 새 보증 신청 건을 생성한다.
 * @param {string} productCode - 신청할 상품 코드
 * @returns {Promise<object>} 생성된 신청 정보
 */
export async function createApplication(productCode) {
  const res = await axiosInstance.post('/api/applications', { productCode });
  return res.data;
}

/** 현재 로그인 사용자의 체크리스트 완료 여부를 조회한다. */
export async function getChecklistCompletion(productCode = null) {
  const res = await axiosInstance.get('/api/applications/check', {
    params: productCode ? { productCode } : undefined,
  });

  const data = res.data;

  if (typeof data === 'boolean') return data;

  const completed =
    data?.completed ??
    data?.isCompleted ??
    data?.checklistCompleted;

  if (completed != null) return Boolean(completed);

  return (
    data?.applicationStatus === 'DONE' ||
    data?.status === 'DONE'
  );
}

export async function getCurrentApplication() {
  const res = await axiosInstance.get('/api/applications/current');
  return res.data;
}

/**
 * 임대차계약서 파일을 업로드한다.
 * @param {number|string} applicationId - 신청 ID
 * @param {File} file - 업로드할 계약서 파일
 * @returns {Promise<object>} 업로드 결과
 */
export async function uploadLeaseContract(applicationId, file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axiosInstance.post(
    `/api/applications/${applicationId}/lease-contract`,
    formData,
  );
  return normalizeOcrInfo(res.data);
}

/**
 * 신청 건의 입력 정보를 조회한다.
 * @param {number|string} applicationId - 신청 ID
 * @returns {Promise<object>} 신청 정보
 */
export async function getInfo(applicationId) {
  const res = await axiosInstance.get(`/api/applications/${applicationId}/info`);
  return normalizeOcrInfo(res.data);
}

/**
 * 신청 건의 입력 정보를 수정한다.
 * @param {number|string} applicationId - 신청 ID
 * @param {object} data - 수정할 정보
 * @returns {Promise<object>} 수정된 정보
 */
export async function updateInfo(applicationId, data) {
  const res = await axiosInstance.patch(
    `/api/applications/${applicationId}/info`,
    toOcrUpdateRequest(data),
  );
  return normalizeOcrInfo(res.data);
}

/**
 * 특정 단계의 질문 목록을 조회한다. 최초 진입(STEP1)에만 쓰고, 이후 단계는
 * submitAnswers()의 응답으로 진행한다 — step은 서버가 정하는 것이라 순차가 아니다.
 * @param {number|string} applicationId - 신청 ID
 * @param {string} questionStep - 질문 단계 (예: 'STEP1')
 * @returns {Promise<{questionStep: string, questions: object[], isFinalStep: boolean}>}
 */
export async function getQuestions(applicationId, questionStep) {
  const res = await axiosInstance.get(`/api/applications/${applicationId}/questions`, {
    params: { step: questionStep },
  });
  return normalizeQuestionResponse(res.data, questionStep);
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
  const requestBody = {
    currentStep,
    finalSubmission: Boolean(finalSubmission),
    selectedOptionIds,
  };

  const res = await axiosInstance.post(
    `/api/applications/${applicationId}/answers`,
    requestBody,
  );
  const data = res.data;

  const nextQuestionResponse = normalizeQuestionResponse(data);
  const hasNextQuestions =
    nextQuestionResponse.questionStep != null && nextQuestionResponse.questions.length > 0;

  if (isQuestionnaireDone(data) && !hasNextQuestions) {
    return { done: true, questionStep: null, questions: null, isFinalStep: true };
  }

  return {
    done: false,
    questionStep: nextQuestionResponse.questionStep,
    questions: nextQuestionResponse.questions,
    isFinalStep: nextQuestionResponse.isFinalStep,
  };
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
  const res = await axiosInstance.get(
    `/api/applications/${applicationId}/result-documents`,
  );
  return res.data;
}
