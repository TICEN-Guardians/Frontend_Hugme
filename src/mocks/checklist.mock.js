// 스키마 미확정 — 백엔드 확인 필요

export const mockApplication = {
  applicationId: 101,
  productCode: 'GENERAL',
  status: 'IN_PROGRESS',
};

// OCR로 추출되는 계약 정보. Design 05(3-2b) "OCR 분석 결과 확인" 모달 기준.
export const mockApplicationInfo = {
  applicationId: 101,
  contractAddress: '서울시 강서구 화곡로 123, 402호',
  housingType: 'OFFICETEL',
  contractType: 'NEW',
  tenantType: 'INDIVIDUAL',
  landlordType: 'INDIVIDUAL',
  fixedDateStatus: 'RECEIVED',
  fixedDate: '2026-07-15',
  officetelResidential: 'YES',
  landlordProxyContract: 'NO',
};

export const mockUploadResponse = {
  applicationId: 101,
  uploaded: true,
};

// questionStep 스키마는 확정(GET .../questions?step= 응답 그대로).
// isFinalStep과 questions[].helpText는 확정 스키마에 없는 필드 — 프론트에서 필요해서 임의로 추가.
// 실제 백엔드에 없으면 helpText는 자연히 안 옴 → 툴팁이 안 뜨는 것으로 graceful하게 처리됨.
export const mockQuestionsByStep = {
  STEP1: {
    questionStep: 'STEP1',
    isFinalStep: false,
    questions: [
      {
        questionId: 1,
        questionText: '임차인은 개인사업자인가요?',
        helpText:
          '개인사업자로 등록되어 있으면 사업자등록증 사본을 함께 제출해야 해요. 근로소득자만 있으면 아니오를 선택하세요.',
        options: [
          { optionId: 1, optionText: '예' },
          { optionId: 2, optionText: '아니오' },
        ],
      },
      {
        questionId: 2,
        questionText: '임차인 법인은 중소기업에 해당하나요?',
        options: [
          { optionId: 3, optionText: '예' },
          { optionId: 4, optionText: '아니오' },
        ],
      },
      {
        questionId: 3,
        questionText: '법인 대표자가 직접 보증을 신청하나요?',
        options: [
          { optionId: 5, optionText: '예' },
          { optionId: 6, optionText: '아니오' },
        ],
      },
    ],
  },
  // STEP2는 의도적으로 없음 — STEP1 제출 시 STEP2를 건너뛰고 STEP3로 가는 mock 분기 확인용.
  STEP3: {
    questionStep: 'STEP3',
    isFinalStep: true,
    questions: [
      {
        questionId: 7,
        questionText: '지정인에게 보증가입 사실을 통지하시겠어요?',
        options: [
          { optionId: 13, optionText: '예' },
          { optionId: 14, optionText: '아니오' },
        ],
      },
      {
        questionId: 8,
        questionText: '주민등록등본·주민등록증으로 신분 확인이 가능한가요?',
        options: [
          { optionId: 15, optionText: '예' },
          { optionId: 16, optionText: '아니오' },
        ],
      },
    ],
  },
};

/**
 * POST /answers mock. currentStep만 보고 다음 step을 정한다(선택한 옵션 내용은 안 봄 — mock 단순화).
 * STEP1 → STEP3로 건너뛰는 분기를 보여주기 위한 것.
 */
export function mockSubmitAnswers(currentStep) {
  if (currentStep === 'STEP1') {
    return { done: false, ...mockQuestionsByStep.STEP3 };
  }
  return { done: true, questionStep: null, questions: null, isFinalStep: true };
}

// GET /api/applications/{id}/documents — 질문 완료 후 확정된 최종 서류 목록.
// Design 16(3-3a) "임대차계약서 분석 완료 — 서류 목록" 기준.
// 스키마 판단: 평평한 배열 + 각 항목에 sectionCode를 붙이는 형태로 가정했다.
// (섹션별로 중첩된 응답이 아니라고 본 이유는 응답 본문 설명 참고)
// 필드는 6차 checklist의 Document와 거의 동일(title/description/tag/acceptedVariants) + status만 추가.
// acceptedVariants: null(=단독형) | 배열(=확장형) — 개수로 판단하지 않는다.
export const mockDocuments = [
  {
    documentId: 1,
    sectionCode: 'BASIC',
    title: '전세계약서',
    description: '확정일자·계약 형태를 확인하는 계약 서류.',
    tag: '전세계약서',
    status: { label: '제출 확정', tone: 'accent' },
    acceptedVariants: [
      '확정일자부 전세계약서 (신규)',
      '갱신계약서 + 최초 전세계약서 (갱신)',
      '임대차계약 신고필증 (확정일자 대체)',
    ],
  },
  {
    documentId: 2,
    sectionCode: 'BASIC',
    title: '전입세대확인서',
    description: '선순위 전입 세대 확인.',
    tag: '전입 확인',
    status: { label: '제출 확정', tone: 'accent' },
    acceptedVariants: ['전입세대확인서 (최근 1개월 이내 발급)'],
  },
  {
    documentId: 3,
    sectionCode: 'BASIC',
    title: '전세보증금 지급 확인서류',
    description: '보증금 실제 지급 증빙. 계약서에서 완납 확인 시 생략 가능.',
    tag: '보증금 지급',
    status: { label: '제출 확정', tone: 'accent' },
    acceptedVariants: null,
  },
  {
    documentId: 4,
    sectionCode: 'BASIC',
    title: '주민등록등본 및 신분증',
    description: '임차인 본인·거주 확인 (최근 1개월 이내).',
    tag: '신청인',
    status: { label: '제출 확정', tone: 'accent' },
    acceptedVariants: ['주민등록등본', '주민등록증 사본'],
  },
  {
    documentId: 5,
    sectionCode: 'BASIC',
    title: '부동산등기부등본',
    description: '권리관계 확인 (최근 1개월 이내).',
    tag: '부동산',
    status: { label: '제출 확정', tone: 'accent' },
    acceptedVariants: ['부동산등기부등본 (최근 1개월 이내 발급)'],
  },
  {
    documentId: 6,
    sectionCode: 'BASIC',
    title: '건축물대장',
    description: '아파트 제외. 위반건축물 기재 시 보증가입 불가.',
    tag: '건축물',
    status: { label: '제출 확정', tone: 'accent' },
    acceptedVariants: ['건축물대장 (세움터·정부24 발급)'],
  },
  {
    documentId: 7,
    sectionCode: 'ADDITIONAL',
    title: '금융기관 전세자금대출 및 담보제공 확인서',
    description: '전세자금대출이 있는 경우 대출·담보 내역 기재.',
    tag: '금융기관',
    status: { label: '해당 없음', tone: 'neutral' },
    acceptedVariants: null,
  },
  {
    documentId: 8,
    sectionCode: 'DISCOUNT',
    title: '한부모가족 증명서',
    description: '보증료 할인 대상 확인용 서류.',
    tag: '보증료 할인',
    status: { label: '제출 확정', tone: 'accent' },
    acceptedVariants: ['한부모가족 증명서 (행정복지센터 발급)'],
  },
];
