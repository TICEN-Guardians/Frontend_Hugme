import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createApplication,
  getChecklistCompletion,
  getCurrentApplication,
  getInfo,
  getResultDocuments,
  updateInfo,
  uploadLeaseContract,
} from '../api/checklist/checklistService.js';

export const LAST_DOCUMENT_CHAT_APPLICATION_ID_KEY = 'hugme:lastDocumentChatApplicationId';
export const CHECKLIST_COMPLETED_EVENT = 'hugme:checklist-completed';

/**
 * 계약서 업로드 → 분석 중 → OCR 결과 확인 → 질문 → 완료 흐름을 관리한다.
 * step: 'idle' | 'analyzing' | 'ocrConfirm' | 'questions' | 'done'
 */
export function useContractUpload(
  productCode,
  {
    isAuthenticated = true,
    isAuthLoading = false,
  } = {},
) {
  const [step, setStep] = useState('idle');
  const [applicationId, setApplicationId] = useState(null);
  const [ocrInfo, setOcrInfo] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [finalDocuments, setFinalDocuments] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [isPreparingUpload, setIsPreparingUpload] = useState(false);
  const [isExistingChecklistModalOpen, setIsExistingChecklistModalOpen] = useState(false);
  const existingChecklistChoiceResolverRef = useRef(null);

  useEffect(() => {
    // 새 탭·새로고침에서는 AuthProvider가 먼저 Access Token을 복구해야 한다.
    // 인증 초기화 전에 결과 API를 호출하면 Authorization 헤더가 없어 401이 발생한다.
    if (isAuthLoading) {
      setIsRestoring(true);
      return undefined;
    }

    if (!isAuthenticated) {
      setIsRestoring(false);
      return undefined;
    }

    let ignore = false;
    const applicationIdFromUrl = new URLSearchParams(window.location.search).get('applicationId');
    let savedApplicationId = applicationIdFromUrl;

    if (!savedApplicationId) {
      try {
        savedApplicationId = sessionStorage.getItem(LAST_DOCUMENT_CHAT_APPLICATION_ID_KEY);
      } catch {
        savedApplicationId = null;
      }
    }

    if (applicationIdFromUrl) {
      try {
        sessionStorage.setItem(
          LAST_DOCUMENT_CHAT_APPLICATION_ID_KEY,
          applicationIdFromUrl,
        );
      } catch {
        // URL의 ID로 현재 결과는 계속 복원한다.
      }

      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete('applicationId');
      window.history.replaceState(
        window.history.state,
        '',
        `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`,
      );
    }

    if (!savedApplicationId) {
      setIsRestoring(false);
      return undefined;
    }

    setApplicationId(savedApplicationId);
    setIsRestoring(true);

    Promise.allSettled([
      getInfo(savedApplicationId),
      getResultDocuments(savedApplicationId),
    ])
      .then(([infoResult, documentsResult]) => {
        if (ignore) return;

        if (infoResult.status === 'fulfilled') {
          setOcrInfo(infoResult.value);
        }

        if (documentsResult.status === 'fulfilled') {
          setFinalDocuments(documentsResult.value);
          setStep('done');
        } else if (infoResult.status === 'fulfilled') {
          setStep('idle');
        } else {
          sessionStorage.removeItem(LAST_DOCUMENT_CHAT_APPLICATION_ID_KEY);
          setApplicationId(null);
          setStep('idle');
        }
      })
      .finally(() => {
        if (!ignore) setIsRestoring(false);
      });

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, isAuthLoading]);

  const resetForNewApplication = useCallback(() => {
    setApplicationId(null);
    setOcrInfo(null);
    setFinalDocuments(null);
    setStep('idle');
    sessionStorage.removeItem(LAST_DOCUMENT_CHAT_APPLICATION_ID_KEY);
  }, []);

  const requestExistingChecklistChoice = useCallback(
    () =>
      new Promise((resolve) => {
        existingChecklistChoiceResolverRef.current = resolve;
        setIsExistingChecklistModalOpen(true);
      }),
    [],
  );

  const resolveExistingChecklistChoice = useCallback((choice) => {
    const resolve = existingChecklistChoiceResolverRef.current;
    existingChecklistChoiceResolverRef.current = null;
    setIsExistingChecklistModalOpen(false);
    resolve?.(choice);
  }, []);

  const useExistingChecklist = useCallback(() => {
    resolveExistingChecklistChoice('existing');
  }, [resolveExistingChecklistChoice]);

  const startNewChecklist = useCallback(() => {
    resolveExistingChecklistChoice('new');
  }, [resolveExistingChecklistChoice]);

  const closeExistingChecklistModal = useCallback(() => {
    resolveExistingChecklistChoice('cancel');
  }, [resolveExistingChecklistChoice]);

  /**
   * 계약서 파일 선택 전에 동일 상품의 완료 내역을 확인한다.
   * true를 반환하면 신규 업로드를 위해 파일 선택창을 열고,
   * false를 반환하면 기존 내역을 표시하거나 오류 처리를 끝낸다.
   */
  const prepareUpload = useCallback(async () => {
    if (isPreparingUpload) return false;

    setIsPreparingUpload(true);
    setUploadError(null);

    try {
      const exists = await getChecklistCompletion(productCode);

      if (!exists) {
        resetForNewApplication();
        return true;
      }

      const choice = await requestExistingChecklistChoice();

      if (choice === 'cancel') {
        return false;
      }

      if (choice === 'new') {
        resetForNewApplication();
        return true;
      }

      const application = await getCurrentApplication(productCode);

      // /check 결과와 현재 신청 사이에 상태가 바뀐 경우 신규 업로드로 전환한다.
      if (application.productCode !== productCode) {
        resetForNewApplication();
        return true;
      }

      const currentApplicationId = application.applicationId;
      const [info, documents] = await Promise.all([
        getInfo(currentApplicationId),
        getResultDocuments(currentApplicationId),
      ]);

      setApplicationId(currentApplicationId);
      setOcrInfo(info);
      setFinalDocuments(documents);
      setStep('done');
      sessionStorage.setItem(
        LAST_DOCUMENT_CHAT_APPLICATION_ID_KEY,
        String(currentApplicationId),
      );

      return false;
    } catch (err) {
      setUploadError(err);
      return false;
    } finally {
      setIsPreparingUpload(false);
    }
  }, [
    isPreparingUpload,
    productCode,
    requestExistingChecklistChoice,
    resetForNewApplication,
  ]);

  const startUpload = useCallback(
    async (file, { forceNew = false } = {}) => {
      setUploadError(null);
      setStep('analyzing');

      try {
        // 이전 시도에서 만들어진 applicationId가 있으면 재사용하고 새로 만들지 않는다.
        let currentApplicationId = forceNew ? null : applicationId;
        if (forceNew) {
          setApplicationId(null);
          setOcrInfo(null);
          setFinalDocuments(null);
          sessionStorage.removeItem(LAST_DOCUMENT_CHAT_APPLICATION_ID_KEY);
        }

        if (!currentApplicationId) {
          const application = await createApplication(productCode);
          currentApplicationId = application.applicationId;
          setApplicationId(currentApplicationId);
          sessionStorage.setItem(LAST_DOCUMENT_CHAT_APPLICATION_ID_KEY, String(currentApplicationId));

          if (application.applicationStatus === 'DONE' || application.status === 'DONE') {
            const docs = await getResultDocuments(currentApplicationId);
            setFinalDocuments(docs);
            setStep('done');
            return;
          }
        }

        await uploadLeaseContract(currentApplicationId, file);
        const info = await getInfo(currentApplicationId);
        setOcrInfo(info);
        setStep('ocrConfirm');
      } catch (err) {
        setUploadError(err);
        setStep('idle');
      }
    },
    [applicationId, productCode],
  );

  const restartUpload = useCallback(
    (file) => startUpload(file, { forceNew: true }),
    [startUpload],
  );

  const confirmOcrInfo = useCallback(
    async (formValues) => {
      if (!applicationId) return;
      setIsConfirming(true);
      try {
        const updated = await updateInfo(applicationId, formValues);
        setOcrInfo(updated);
        setStep('questions');
      } catch (err) {
        setUploadError(err);
      } finally {
        setIsConfirming(false);
      }
    },
    [applicationId],
  );

  const closeOcrConfirm = useCallback(() => {
    setStep('idle');
  }, []);

  const reopenOcrConfirm = useCallback(() => {
    setStep('ocrConfirm');
  }, []);

  /** 질문 흐름이 끝난 뒤 최종 서류 목록을 받아와 'done'으로 전환한다. */
  const finishQuestions = useCallback(async () => {
    if (!applicationId) return;
  
    try {
      const result = await getResultDocuments(applicationId);
  
      setFinalDocuments(result);

      setStep('done');
      window.dispatchEvent(new Event(CHECKLIST_COMPLETED_EVENT));
    } catch (err) {
      setUploadError(err);
    }
  }, [applicationId]);

  return {
    step,
    applicationId,
    ocrInfo,
    uploadError,
    isConfirming,
    isRestoring,
    isPreparingUpload,
    isExistingChecklistModalOpen,
    finalDocuments,
    prepareUpload,
    useExistingChecklist,
    startNewChecklist,
    closeExistingChecklistModal,
    startUpload,
    restartUpload,
    confirmOcrInfo,
    closeOcrConfirm,
    reopenOcrConfirm,
    finishQuestions,
  };
}
