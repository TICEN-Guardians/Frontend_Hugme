import { useCallback, useState } from 'react';
import { getQuestions, submitAnswers } from '../services/checklist/checklistService.js';

const FIRST_STEP = 'STEP1';
const SECOND_STEP = 'STEP2';

/**
 * STEP1/STEP2는 각각 조회하고, STEP2부터 누적된 모든 답변을 /answers에 제출한다.
 * 이후 추가 질문도 이전 답변과 합쳐 반복 제출하며 서버의 완료 응답을 따른다.
 */
export function useQuestionFlow(applicationId) {
  const [questionStep, setQuestionStep] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isFinalStep, setIsFinalStep] = useState(false);
  const [visitedSteps, setVisitedSteps] = useState([]);
  const [selectedOptionIds, setSelectedOptionIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const start = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setVisitedSteps([]);
    setSelectedOptionIds([]);

    getQuestions(applicationId, FIRST_STEP)
      .then((data) => {
        setQuestionStep(data.questionStep);
        setQuestions(data.questions ?? []);
        setIsFinalStep(false);
        setVisitedSteps([data.questionStep]);
      })
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, [applicationId]);

  /**
   * @param {number[]} currentSelectedOptionIds 현재 화면에서 고른 optionId
   * @returns {Promise<boolean>} true면 전체 질문 완료
   */
  const submitStep = useCallback(
    async (currentSelectedOptionIds) => {
      setIsSubmitting(true);
      setError(null);

      const accumulatedOptionIds = [...selectedOptionIds, ...currentSelectedOptionIds];

      try {
        // STEP1은 제출하지 않고 답변을 저장한 뒤 STEP2 질문을 별도로 조회한다.
        if (questionStep === FIRST_STEP) {
          const data = await getQuestions(applicationId, SECOND_STEP);
          setSelectedOptionIds(accumulatedOptionIds);
          setQuestionStep(data.questionStep);
          setQuestions(data.questions ?? []);
          setIsFinalStep(false);
          setVisitedSteps((prev) => [...prev, data.questionStep]);
          return false;
        }

        // STEP2부터는 지금까지 고른 답변 전체를 매번 함께 보낸다.
        const finalSubmission = questionStep !== SECOND_STEP;
        const result = await submitAnswers(
          applicationId,
          questionStep,
          accumulatedOptionIds,
          finalSubmission,
        );

        if (result.done) {
          setSelectedOptionIds(accumulatedOptionIds);
          return true;
        }

        if (!result.questionStep) {
          setError(new Error('다음 질문 단계가 응답에 없습니다.'));
          return false;
        }

        setSelectedOptionIds(accumulatedOptionIds);

        setQuestionStep(result.questionStep);
        setQuestions(result.questions ?? []);
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
    [applicationId, questionStep, selectedOptionIds],
  );

  return {
    questionStep,
    questions,
    isFinalStep,
    visitedSteps,
    isLoading,
    isSubmitting,
    error,
    start,
    submitStep,
  };
}
