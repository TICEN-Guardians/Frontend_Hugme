import { useEffect, useState } from 'react';
import { FaCircleQuestion } from 'react-icons/fa6';
import Button from '../../common/Button/Button.jsx';
import Modal from '../../common/Modal/Modal.jsx';
import styles from './QuestionModal.module.css';

export default function QuestionModal({
  isOpen,
  questionStep,
  questions,
  isFinalStep,
  visitedSteps,
  isSubmitting,
  onSubmitStep,
}) {
  const [answers, setAnswers] = useState({});
  const [openTooltipId, setOpenTooltipId] = useState(null);

  useEffect(() => {
    setAnswers({});
    setOpenTooltipId(null);
  }, [questionStep]);

  const handleSelect = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const allAnswered =
    questions.length > 0 && questions.every((question) => answers[question.questionId] != null);

  const handleNext = () => {
    if (!allAnswered) return;
    const selectedOptionIds = questions.map((question) => answers[question.questionId]);
    onSubmitStep(selectedOptionIds);
  };

  const stepNumber = (questionStep ?? '').replace(/\D/g, '') || '?';

  return (
    <Modal isOpen={isOpen} onClose={() => {}}>
      <p className={styles.eyebrow}>맞춤 서류 확인</p>

      <div className={styles.headerRow}>
        <h2 className={styles.title}>{stepNumber}단계 · 확인 질문</h2>
        <div className={styles.progress} aria-hidden="true">
          {visitedSteps.map((step, index) => (
            <span
              key={step}
              className={`${styles.progressDot} ${
                index === visitedSteps.length - 1 ? styles.progressDotActive : ''
              }`}
            />
          ))}
        </div>
      </div>

      <p className={styles.note}>
        답에 따라 서류가 <strong className={styles.legendConfirmed}>제출 확정</strong> /{' '}
        <strong className={styles.legendNeutral}>해당 없음</strong>으로 정해져요.
      </p>

      <div className={styles.questions}>
        {questions.map((question) => (
          <div key={question.questionId} className={styles.questionRow}>
            <div className={styles.questionText}>
              {question.questionText}
              {question.helpText && (
                <span className={styles.tooltipWrapper}>
                  <button
                    type="button"
                    className={styles.helpIcon}
                    onClick={() =>
                      setOpenTooltipId((prev) =>
                        prev === question.questionId ? null : question.questionId,
                      )
                    }
                    aria-label="도움말 보기"
                  >
                    <FaCircleQuestion aria-hidden="true" />
                  </button>
                  {openTooltipId === question.questionId && (
                    <span className={styles.tooltip} role="tooltip">
                      {question.helpText}
                    </span>
                  )}
                </span>
              )}
            </div>

            <div className={styles.options} role="radiogroup" aria-label={question.questionText}>
              {question.options.map((option) => (
                <button
                  key={option.optionId}
                  type="button"
                  role="radio"
                  aria-checked={answers[question.questionId] === option.optionId}
                  className={`${styles.option} ${
                    answers[question.questionId] === option.optionId ? styles.optionActive : ''
                  }`}
                  onClick={() => handleSelect(question.questionId, option.optionId)}
                >
                  {option.optionText}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <Button type="button" disabled={!allAnswered || isSubmitting} onClick={handleNext}>
          {isSubmitting ? '제출 중...' : isFinalStep ? '완료' : '다음'}
        </Button>
      </div>
    </Modal>
  );
}
