import axiosInstance from '../axiosInstance.js';

export const KAKAO_NOTIFICATION_PENDING_KEY = 'hugme:pendingKakaoNotification';

function getNotificationBaseUrl(applicationId) {
  return `/api/applications/${applicationId}/notifications`;
}

/** 카카오톡 나에게 보내기 권한을 요청할 인증 URL을 생성한다. */
export async function createKakaoAuthorization(applicationId) {
  const response = await axiosInstance.post(
    `${getNotificationBaseUrl(applicationId)}/kakao/authorize`,
  );

  return response.data;
}

/**
 * 카카오 인증 결과와 계약 날짜를 전달하여 신청기한 알림을 전송한다.
 * 날짜 값은 YYYY-MM-DD 형식의 문자열로 전달한다.
 */
export async function sendKakaoNotification(
  applicationId,
  {
    code,
    state,
    contractStartDate,
    contractEndDate,
    balancePaymentDate,
    moveInDate,
  },
) {
  const response = await axiosInstance.post(
    `${getNotificationBaseUrl(applicationId)}/kakao/me`,
    {
      code,
      state,
      contractStartDate,
      contractEndDate,
      balancePaymentDate,
      moveInDate,
    },
  );

  return response.data;
}
