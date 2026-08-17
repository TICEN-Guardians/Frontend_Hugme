import { useCallback, useState } from 'react';
import { getQuestions, submitAnswers } from '../services/checklist/checklistService.js';

const FIRST_STEP = 'STEP1';

/**
 * 질문 step 흐름을 관리한다. step은 서버가 정하므로 클라이언트는 증가시키지 않고,
 * 서버가 알려주는 questionStep을 그대로 따라간다.
 * @param {number|string} applicationId - 신청 ID
 */
export function useQuestionFlow(applicationId) {
  const [questionStep, setQuestionStep] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isFinalStep, setIsFinalStep] = useState(false);
  const [visitedSteps, setVisitedSteps] = useState([]); // 진행바 표시용 — 지나온 step들 (총 개수 아님)
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const start = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setVisitedSteps([]);
    getQuestions(applicationId, FIRST_STEP)
      .then((data) => {
        setQuestionStep(data.questionStep);
        setQuestions(data.questions);
        setIsFinalStep(data.isFinalStep);
        setVisitedSteps([data.questionStep]);
      })
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, [applicationId]);

  /**
   * @param {number[]} selectedOptionIds
   * @returns {Promise<boolean>} true면 질문 흐름이 끝났다는 뜻
   */
  const submitStep = useCallback(
    async (selectedOptionIds) => {
      setIsSubmitting(true);
      setError(null);
      try {
        const result = await submitAnswers(applicationId, questionStep, selectedOptionIds, isFinalStep);
        if (result.done) {
          return true;
        }

        let nextQuestions = result.questions;
        let nextIsFinalStep = result.isFinalStep;
        if (!nextQuestions) {
          const nextData = await getQuestions(applicationId, result.questionStep);
          nextQuestions = nextData.questions;
          nextIsFinalStep = nextData.isFinalStep;
        }

        setQuestionStep(result.questionStep);
        setQuestions(nextQuestions ?? []);
        setIsFinalStep(nextIsFinalStep);
        setVisitedSteps((prev) => [...prev, result.questionStep]);
        return false;
      } catch (err) {
        setError(err);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [applicationId, questionStep, isFinalStep],
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
