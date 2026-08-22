import axiosInstance from '../axiosInstance.js';

const PREPARE_APPLICATION_BASE_URL = '/api/applications/prepare';

/** 비로그인 모의테스트 신청을 생성한다. */
export async function createPrepareApplication(productCode) {
  const response = await axiosInstance.post(
    PREPARE_APPLICATION_BASE_URL,
    { productCode },
  );

  return response.data;
}

/** 모의테스트에 저장된 신청정보를 조회한다. */
export async function getPrepareInfo(applicationId) {
  const response = await axiosInstance.get(
    `${PREPARE_APPLICATION_BASE_URL}/${applicationId}/info`,
  );

  return response.data;
}

/** 모의테스트 신청정보를 수정하고 확정한다. */
export async function updatePrepareInfo(applicationId, request) {
  const response = await axiosInstance.patch(
    `${PREPARE_APPLICATION_BASE_URL}/${applicationId}/info`,
    request,
  );

  return response.data;
}

/** 모의테스트의 특정 단계 질문을 조회한다. */
export async function getPrepareQuestions(applicationId, questionStep) {
  const response = await axiosInstance.get(
    `${PREPARE_APPLICATION_BASE_URL}/${applicationId}/questions`,
    {
      params: { step: questionStep },
    },
  );

  return response.data;
}

/** 모의테스트의 단계별 답변을 제출한다. */
export async function submitPrepareAnswers(
  applicationId,
  currentStep,
  selectedOptionIds,
  finalSubmission,
) {
  const response = await axiosInstance.post(
    `${PREPARE_APPLICATION_BASE_URL}/${applicationId}/answers`,
    {
      currentStep,
      selectedOptionIds,
      finalSubmission: Boolean(finalSubmission),
    },
  );

  return response.data;
}

/** 모의테스트 질문 결과로 계산된 최종 준비서류를 조회한다. */
export async function getPrepareResultDocuments(applicationId) {
  const response = await axiosInstance.get(
    `${PREPARE_APPLICATION_BASE_URL}/${applicationId}/result-documents`,
  );

  return response.data;
}
