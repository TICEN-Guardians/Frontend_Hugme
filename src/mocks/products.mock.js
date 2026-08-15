// 스키마 미확정 — 백엔드 확인 필요
//
// section.items: null(=하위 pill 없음, section.documents를 바로 사용) | 배열(=pill 목록, 각 pill로 getItemDocuments 조회)
// document.acceptedVariants: null(=단독형, 펼침 불가) | 배열(=확장형, 인라인으로 펼쳐서 표시). 개수로 판단하지 않는다.

export const mockChecklistByProduct = {
  GENERAL: {
    productCode: 'GENERAL',
    sections: [
      {
        sectionCode: 'BASIC',
        sectionTitle: '기본서류',
        documentCount: 3,
        items: null,
        documents: [
          {
            documentId: 1,
            title: '전세계약서',
            description: '확정일자·계약 형태를 확인하는 계약 서류.',
            tag: '전세계약서',
            acceptedVariants: [
              '확정일자부 전세계약서 (신규)',
              '갱신계약서 + 최초 전세계약서 (갱신)',
              '임대차계약 신고필증 (확정일자 대체)',
            ],
          },
          {
            documentId: 2,
            title: '전입세대확인서',
            description: '선순위 전입 세대 확인.',
            tag: '전입 확인',
            acceptedVariants: ['전입세대확인서 (최근 1개월 이내 발급)'],
          },
          {
            documentId: 3,
            title: '전세보증금 지급 확인서류',
            description: null,
            tag: '보증금 지급',
            acceptedVariants: null,
          },
        ],
      },
      {
        sectionCode: 'ADDITIONAL',
        sectionTitle: '추가서류',
        documentCount: 1,
        items: [
          { itemId: 'GENERAL_ADD_LOAN', label: '전세자금대출 관련' },
          { itemId: 'GENERAL_ADD_INCOME', label: '소득확인' },
        ],
        documents: null,
      },
      {
        sectionCode: 'DISCOUNT',
        sectionTitle: '보증료 할인 서류',
        documentCount: 0,
        items: [],
        documents: null,
      },
    ],
  },
  SPECIAL: {
    productCode: 'SPECIAL',
    sections: [
      {
        sectionCode: 'BASIC',
        sectionTitle: '기본서류',
        documentCount: 2,
        items: null,
        documents: [
          {
            documentId: 5,
            title: '전세계약서',
            description: '세입자 보호조치 특약이 계약서에서 확인되어야 함.',
            tag: '전세계약서',
            acceptedVariants: ['확정일자부 전세계약서 (특약 포함)'],
          },
          {
            documentId: 6,
            title: '전입세대확인서',
            description: null,
            tag: '전입 확인',
            acceptedVariants: null,
          },
        ],
      },
      {
        sectionCode: 'ADDITIONAL',
        sectionTitle: '추가서류',
        documentCount: 0,
        items: null,
        documents: [],
      },
      {
        sectionCode: 'DISCOUNT',
        sectionTitle: '보증료 할인 서류',
        documentCount: 0,
        items: [{ itemId: 'SPECIAL_DISCOUNT_1', label: '특례 보증료 할인' }],
        documents: null,
      },
    ],
  },
};

export const mockItemDocuments = {
  GENERAL_ADD_LOAN: [
    {
      documentId: 10,
      title: '금융기관 전세자금대출 및 담보제공 확인서',
      description: '전세자금대출이 있는 경우 대출·담보 내역 기재.',
      tag: '금융기관',
      acceptedVariants: ['대출 실행 확인서', '담보 제공 확인서'],
    },
  ],
  GENERAL_ADD_INCOME: [],
  SPECIAL_DISCOUNT_1: [],
};
