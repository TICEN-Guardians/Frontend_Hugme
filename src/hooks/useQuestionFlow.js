import { useCallback, useState } from 'react';
import { getQuestions, submitAnswers } from '../api/checklist/checklistService.js';

const FIRST_STEP = 'STEP1';
const SECOND_STEP = 'STEP2';
const THIRD_STEP = 'STEP3';

/**
 * STEP1/STEP2는 각각 조회하고, STEP2부터 누적된 모든 답변을 /answers에 제출한다.
 * 이후 추가 질문도 이전 답변과 합쳐 반복 제출하며 서버의 완료 응답을 따른다.
 */
export function useQuestionFlow(
  applicationId,
  {
    getQuestionsRequest = getQuestions,
    submitAnswersRequest = submitAnswers,
  } = {},
) {
  const [questionStep, setQuestionStep] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isFinalStep, setIsFinalStep] = useState(false);
  const [visitedSteps, setVisitedSteps] = useState([]);
  const [selectedOptionIds, setSelectedOptionIds] = useState([]);
  const [currentAnswerIds, setCurrentAnswerIds] = useState([]);
  const [stepHistory, setStepHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const reset = useCallback(() => {
    setQuestionStep(null);
    setQuestions([]);
    setIsFinalStep(false);
    setVisitedSteps([]);
    setSelectedOptionIds([]);
    setCurrentAnswerIds([]);
    setStepHistory([]);
    setError(null);
    setIsLoading(false);
    setIsSubmitting(false);
  }, []);

  const start = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setVisitedSteps([]);
    setSelectedOptionIds([]);
    setCurrentAnswerIds([]);
    setStepHistory([]);

    getQuestionsRequest(applicationId, FIRST_STEP)
      .then((data) => {
        setQuestionStep(data.questionStep);
        setQuestions(data.questions ?? []);
        setIsFinalStep(false);
        setVisitedSteps([data.questionStep]);
      })
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, [applicationId, getQuestionsRequest]);

  /**
   * @param {number[]} currentSelectedOptionIds 현재 화면에서 고른 optionId
   * @returns {Promise<boolean>} true면 전체 질문 완료
   */
  const submitStep = useCallback(
    async (currentSelectedOptionIds) => {
      setIsSubmitting(true);
      setError(null);

      const accumulatedOptionIds = [...selectedOptionIds, ...currentSelectedOptionIds];
      const currentSnapshot = {
        questionStep,
        questions,
        isFinalStep,
        selectedOptionIdsBefore: selectedOptionIds,
        answerIds: currentSelectedOptionIds,
      };

      try {
        // STEP1은 제출하지 않고 답변을 저장한 뒤 STEP2 질문을 별도로 조회한다.
        if (questionStep === FIRST_STEP) {
          const step2Data = await getQuestionsRequest(
            applicationId,
            SECOND_STEP,
          );

          // STEP2 질문이 있으면 일반·특례 갱신 흐름으로 진행
          if (step2Data.questions?.length > 0) {
            setSelectedOptionIds(accumulatedOptionIds);
            setCurrentAnswerIds([]);
            setStepHistory((prev) => [...prev, currentSnapshot]);
            setQuestionStep(SECOND_STEP);
            setQuestions(step2Data.questions);
            setIsFinalStep(false);
            setVisitedSteps((prev) => [...prev, SECOND_STEP]);

            return false;
          }

          /*
           * STEP2 질문이 없으면 특례 신규계약이다.
           * STEP1 답변을 최종 제출하면 서버가 다음 중 하나를 반환한다.
           *
           * 1. 추가 질문 있음: nextStep = STEP3
           * 2. 추가 질문 없음: questionnaireCompleted = true
           */
          const result = await submitAnswersRequest(
            applicationId,
            FIRST_STEP,
            accumulatedOptionIds,
            true,
          );

          // 추가 질문 없이 바로 완료
          if (result.done) {
            setSelectedOptionIds(accumulatedOptionIds);
            return true;
          }

          // 추가 질문이 있으면 STEP3으로 이동
          if (
            result.questionStep === THIRD_STEP &&
            result.questions?.length > 0
          ) {
            setSelectedOptionIds(accumulatedOptionIds);
            setCurrentAnswerIds([]);
            setStepHistory((prev) => [...prev, currentSnapshot]);
            setQuestionStep(THIRD_STEP);
            setQuestions(result.questions);
            setIsFinalStep(true);
            setVisitedSteps((prev) => [...prev, THIRD_STEP]);

            return false;
          }

          setError(new Error('특례 신규계약의 다음 질문 데이터가 없습니다.'));
          return false;
        }

        // STEP2부터는 지금까지 고른 답변 전체를 매번 함께 보낸다.
        const finalSubmission = questionStep !== SECOND_STEP;
        let result = await submitAnswersRequest(
          applicationId,
          questionStep,
          accumulatedOptionIds,
          finalSubmission,
        );
        // 서버가 이미 완료로 반환한 경우
if (result.done) {
  setSelectedOptionIds(accumulatedOptionIds);
  return true;
}

        // STEP2 제출 결과로 STEP3 질문이 반환된 경우
if (
  questionStep === SECOND_STEP &&
  result.questionStep === THIRD_STEP &&
  result.questions?.length > 0
) {
  setSelectedOptionIds(accumulatedOptionIds);
  setCurrentAnswerIds([]);
  setStepHistory((prev) => [...prev, currentSnapshot]);
  setQuestionStep(THIRD_STEP);
  setQuestions(result.questions);
  setIsFinalStep(true);
  setVisitedSteps((prev) => [...prev, THIRD_STEP]);

  return false;
}
// STEP2에 추가 질문이 없으면 이때 최종 제출한다.
if (
  questionStep === SECOND_STEP &&
  !result.questionStep &&
  !result.questions?.length
) {
  result = await submitAnswersRequest(
    applicationId,
    questionStep,
    accumulatedOptionIds,
    true,
  );

  if (result.done) {
    setSelectedOptionIds(accumulatedOptionIds);
    return true;
  }
}

// 완료도 아니고 다음 질문도 없는 비정상 응답
if (!result.questionStep || !result.questions?.length) {
  setError(new Error('다음 질문 데이터가 없습니다.'));
  return false;
}

setSelectedOptionIds(accumulatedOptionIds);
setCurrentAnswerIds([]);
setStepHistory((prev) => [...prev, currentSnapshot]);
setQuestionStep(result.questionStep);
setQuestions(result.questions);
setIsFinalStep(result.isFinalStep);
setVisitedSteps((prev) => [...prev, result.questionStep]);

return false;


      } catch (err) {
        setError(err);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      applicationId,
      isFinalStep,
      questionStep,
      questions,
      selectedOptionIds,
      getQuestionsRequest,
      submitAnswersRequest,
    ],
  );

  const goBack = useCallback(() => {
    if (stepHistory.length === 0 || isSubmitting) return false;

    const previous = stepHistory[stepHistory.length - 1];
    setQuestionStep(previous.questionStep);
    setQuestions(previous.questions);
    setIsFinalStep(previous.isFinalStep);
    setSelectedOptionIds(previous.selectedOptionIdsBefore);
    setCurrentAnswerIds(previous.answerIds);
    setVisitedSteps((prev) => prev.slice(0, -1));
    setStepHistory((prev) => prev.slice(0, -1));
    setError(null);
    return true;
  }, [isSubmitting, stepHistory]);

  return {
    questionStep,
    questions,
    isFinalStep,
    visitedSteps,
    currentAnswerIds,
    canGoBack: stepHistory.length > 0,
    isLoading,
    isSubmitting,
    error,
    start,
    reset,
    submitStep,
    goBack,
  };
}
