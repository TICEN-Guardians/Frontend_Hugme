import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../../common/Button/Button.jsx';
import Modal from '../../common/Modal/Modal.jsx';
import styles from './QuestionModal.module.css';

const QUESTION_EASE = [0.16, 1, 0.3, 1];

const QUESTION_HELP_TEXT = {
  '임차인은 개인사업자인가요?':
    '예를 선택하면 개인사업자 여부를 확인하기 위한 사업자등록증 사본이 추가될 수 있어요.',
  '법인 임차인은 중소기업에 해당하나요?':
    '중소기업이 아닌 법인 임차인은 전세권 설정 및 공사 이전 관련 서류가 필요할 수 있어요.',
  '법인 대표자가 직접 보증을 신청하나요?':
    '대표자가 아닌 직원 등이 신청하면 위임장과 법인인감증명서가 필요할 수 있어요.',
  '지정인에게 보증가입 사실을 통지하시겠어요?':
    '예를 선택하면 지정인 통지를 위한 개인정보 동의서가 준비서류에 추가돼요.',
  '임차인은 대한민국 국민이며 국내에 거주하나요?':
    '아니오를 선택하면 외국인·외국국적동포·재외국민 여부와 관련 서류를 추가로 확인해요.',
  '임대인은 대한민국 국적이며 국내에 거주하나요?':
    '아니오를 선택하면 임대인의 국적과 해외 거주 여부에 따른 추가 서류를 확인해요.',
  '감정평가금액으로 심사받고자 하나요?':
    '예를 선택하면 감정평가 신청서, 개인정보 동의서 등 감정평가 관련 서류가 추가돼요.',
  '소유권보존등기만 이루어진 신규 분양 아파트인가요?':
    '예를 선택하면 분양계약서와 분양대금완납영수증 등이 추가될 수 있어요.',
  '전세계약서에서 전세보증금 완납 사실을 확인할 수 있나요?':
    '아니오를 선택하면 계좌이체 내역서나 영수증 등 보증금 지급 증빙이 필요할 수 있어요.',
  '건축물대장에 근린생활시설 등 상가가 확인되나요?':
    '예를 선택하면 해당 건물의 상가 임대차 현황을 확인하는 서류가 추가돼요.',
  '해당 주택은 노인복지법에 따른 노인복지주택인가요?':
    '예를 선택하면 노인복지시설 설치신고필증이 준비서류에 추가돼요.',
  '해당하는 사회배려계층 할인 유형을 선택해 주세요.':
    '선택한 할인 유형에 따라 소득, 배우자, 자녀, 가구 구성 등을 확인하는 질문과 증빙서류가 달라져요.',
  '국토교통부 부동산 전자계약시스템을 이용했나요?':
    '예를 선택하면 전자계약 이용에 따른 보증료 할인 적용 여부를 확인해요.',
  '모범납세자에 해당하나요?':
    '예를 선택하면 모범납세자 할인 확인을 위한 증명서가 필요할 수 있어요.',
  '모바일 채널을 통해 보증을 신청하나요?':
    '모바일 채널 신청 여부에 따라 보증료 할인 적용 여부가 달라질 수 있어요.',
  '보증료를 일시납하나요?':
    '보증료 일시납 여부에 따라 보증료 할인 적용 여부가 달라질 수 있어요.',
  '임차인의 국적과 거주 상태를 선택해 주세요.':
    '선택한 국적과 거주 상태에 따라 외국인등록증, 국내거소신고증 등 필요한 서류가 달라져요.',
  '임대인의 국적과 거주 상태를 선택해 주세요.':
    '선택한 국적과 거주 상태에 따라 위임장, 인감증명서 또는 채권양도 관련 서류가 추가될 수 있어요.',
  '현재 혼인 상태를 선택해 주세요.':
    '혼인 상태에 따라 혼인관계증명서, 청첩장 또는 예식장 계약서 등이 필요할 수 있어요.',
  '태아를 자녀 수에 포함하나요?':
    '예를 선택하면 태아를 자녀 수에 포함하기 위한 임신진단서가 필요해요.',
  '배우자가 있나요?':
    '예를 선택하면 배우자의 소득, 주택 소유 여부와 본인 확인을 위한 서류가 추가될 수 있어요.',
  '주민등록등본에서 배우자를 확인할 수 있나요?':
    '아니오를 선택하면 배우자와의 관계를 확인하기 위한 가족관계증명서가 필요할 수 있어요.',
  '다문화가구 구성원이 귀화했나요?':
    '귀화 여부에 따라 귀화 사실 확인 서류 또는 외국인 신원 확인 서류가 달라져요.',
  '외국인등록증 사본을 제출할 수 있나요?':
    '아니오를 선택하면 외국인등록사실증명서나 국내거소신고증 등 대체 서류가 필요할 수 있어요.',
  '해당하는 국가유공자 유형을 선택해 주세요.':
    '선택한 유형에 따라 국가유공자증, 유족증 또는 해당 유형의 확인원이 필요해요.',
  '해당하는 의사상자 유형을 선택해 주세요.':
    '선택한 유형에 따라 의사자 증서, 의사자 유족증 또는 의상자 증서 등이 필요해요.',
};

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
            const helpText =
              question.helpText ?? QUESTION_HELP_TEXT[question.questionText] ?? null;
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
                  {helpText && (
                    <span
                      className={styles.tooltipWrapper}
                      onMouseEnter={() => setOpenTooltipId(question.questionId)}
                      onMouseLeave={() => setOpenTooltipId(null)}
                      onFocus={() => setOpenTooltipId(question.questionId)}
                      onBlur={() => setOpenTooltipId(null)}
                    >
                      <button
                        type="button"
                        className={styles.helpIcon}
                        onClick={() =>
                          setOpenTooltipId((prev) =>
                            prev === question.questionId ? null : question.questionId,
                          )
                        }
                        aria-label="질문 설명 보기"
                      >
                        <span aria-hidden="true">?</span>
                      </button>
                      {openTooltipId === question.questionId && (
                        <span className={styles.tooltip} role="tooltip">
                          {helpText}
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
