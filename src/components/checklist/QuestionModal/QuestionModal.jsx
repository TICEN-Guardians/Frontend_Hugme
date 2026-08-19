import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCircleQuestion } from 'react-icons/fa6';
import Button from '../../common/Button/Button.jsx';
import Modal from '../../common/Modal/Modal.jsx';
import styles from './QuestionModal.module.css';

const QUESTION_EASE = [0.16, 1, 0.3, 1];

const questionListVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.08,
    },
  },
};

const questionCardVariants = {
  hidden: {
    opacity: 0,
    y: 14,
    scale: 0.985,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: QUESTION_EASE,
    },
  },
};

function isDiscountTypeQuestion(questionText) {
  return questionText.includes('사회배려계층') && questionText.includes('할인');
}

function getDisplayQuestions(questions) {
  const discountQuestionIndex = questions.findIndex((question) =>
    isDiscountTypeQuestion(question.questionText),
  );
  const lumpPaymentQuestionIndex = questions.findIndex((question) =>
    question.questionText.includes('보증료') && question.questionText.includes('일시납'),
  );

  if (
    discountQuestionIndex === -1 ||
    lumpPaymentQuestionIndex === -1 ||
    discountQuestionIndex > lumpPaymentQuestionIndex
  ) {
    return questions;
  }

  const displayQuestions = [...questions];
  const [discountQuestion] = displayQuestions.splice(discountQuestionIndex, 1);
  const insertIndex = displayQuestions.findIndex((question) => question === questions[lumpPaymentQuestionIndex]);
  displayQuestions.splice(insertIndex + 1, 0, discountQuestion);
  return displayQuestions;
}

export default function QuestionModal({
  isOpen,
  questionStep,
  questions,
  isFinalStep,
  visitedSteps,
  initialAnswerIds = [],
  isLoading,
  isSubmitting,
  onBack,
  onSubmitStep,
}) {
  const [answers, setAnswers] = useState({});
  const [openTooltipId, setOpenTooltipId] = useState(null);

  useEffect(() => {
    const restoredAnswers = {};
    questions.forEach((question, index) => {
      if (initialAnswerIds[index] != null) {
        restoredAnswers[question.questionId] = initialAnswerIds[index];
      }
    });
    setAnswers(restoredAnswers);
    setOpenTooltipId(null);
  }, [initialAnswerIds, questionStep, questions]);

  const handleSelect = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const allAnswered =
    !isLoading &&
    questions.length > 0 &&
    questions.every((question) => answers[question.questionId] != null);

  const handleNext = () => {
    if (!allAnswered) return;
    const selectedOptionIds = questions.map((question) => answers[question.questionId]);
    onSubmitStep(selectedOptionIds);
  };

  const stepNumber = (questionStep ?? '').replace(/\D/g, '') || '1';
  const currentStepNumber = Number(stepNumber);
  const loadingTitle = isSubmitting ? '다음 단계 준비 중' : '질문을 불러오는 중';
  const loadingDescription = isSubmitting
    ? '선택한 답변을 반영하고 있어요.'
    : '계약 정보에 맞는 질문을 준비하고 있어요.';
  const displayQuestions = getDisplayQuestions(questions);

  return (
    <Modal isOpen={isOpen} onClose={() => {}} panelClassName={styles.modalPanel}>
      <p className={styles.eyebrow}>맞춤 서류 확인</p>

      <div className={styles.headerRow}>
        <h2 className={styles.title}>
          {isLoading ? loadingTitle : `${stepNumber}단계 · 확인 질문`}
        </h2>
        <div className={styles.progress} aria-hidden="true">
          {[1, 2, 3].map((step) => (
            <span key={step} className={styles.progressItem}>
              <span
                className={`${styles.progressNumber} ${
                  step === currentStepNumber ? styles.progressNumberActive : ''
                }`}
              >
                {step}
              </span>
              {step < 3 && (
                <span
                  className={`${styles.progressBar} ${
                    step < currentStepNumber ? styles.progressBarDone : ''
                  }`}
                />
              )}
            </span>
          ))}
        </div>
      </div>

      <p className={styles.note}>
        답에 따라 서류가 <strong className={styles.legendConfirmed}>제출 확정</strong> /{' '}
        <strong className={styles.legendNeutral}>해당 없음</strong>으로 정해져요.
      </p>

      {isLoading ? (
        <div className={styles.loadingState} aria-live="polite">
          <span className={styles.loadingSpinner} aria-hidden="true" />
          <p>{loadingDescription}</p>
        </div>
      ) : (
        <motion.div
          key={questionStep}
          className={styles.questions}
          data-question-count={questions.length}
          variants={questionListVariants}
          initial="hidden"
          animate="show"
        >
          {displayQuestions.map((question) => {
            const optionLayout = isDiscountTypeQuestion(question.questionText)
              ? 'select'
              : question.options.length > 2
                ? 'grid'
                : 'segmented';

            return (
              <motion.div
                key={question.questionId}
                className={styles.questionRow}
                data-option-count={question.options.length}
                data-option-layout={optionLayout}
                variants={questionCardVariants}
              >
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

                {optionLayout === 'select' ? (
                  <select
                    className={styles.selectInput}
                    value={answers[question.questionId] ?? ''}
                    onChange={(event) =>
                      handleSelect(question.questionId, Number(event.target.value))
                    }
                    aria-label={question.questionText}
                  >
                    <option value="" disabled>
                      할인 유형 선택
                    </option>
                    {question.options.map((option) => (
                      <option key={option.optionId} value={option.optionId}>
                        {option.optionText}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div
                    className={styles.options}
                    data-option-count={question.options.length}
                    data-option-layout={optionLayout}
                    role="radiogroup"
                    aria-label={question.questionText}
                  >
                    {question.options.map((option) => (
                      <motion.button
                        key={option.optionId}
                        type="button"
                        role="radio"
                        aria-checked={answers[question.questionId] === option.optionId}
                        className={`${styles.option} ${
                          answers[question.questionId] === option.optionId
                            ? styles.optionActive
                            : ''
                        }`}
                        onClick={() => handleSelect(question.questionId, option.optionId)}
                        whileTap={{ scale: 0.985 }}
                        transition={{ duration: 0.16, ease: QUESTION_EASE }}
                      >
                        {option.optionText}
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <div className={styles.footer}>
        {onBack && (
          <Button type="button" variant="secondary" disabled={isSubmitting} onClick={onBack}>
            {isLoading && !isSubmitting ? '계약정보' : '이전'}
          </Button>
        )}
        <Button type="button" disabled={!allAnswered || isSubmitting} onClick={handleNext}>
          {isSubmitting ? '제출 중...' : isFinalStep ? '완료' : '다음'}
        </Button>
      </div>
    </Modal>
  );
}
