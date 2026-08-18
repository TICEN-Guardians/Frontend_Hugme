// 실제 GET /api/products/{productCode}/checklist?sectionCode=... 응답 형태를 따른다.
export const mockChecklistByProduct = {
  GENERAL: {
    BASIC: {
      productCode: 'GENERAL',
      productName: '일반 반환보증',
      sectionCode: 'BASIC',
      sectionName: '기본서류',
      items: [
        {
          itemId: 1,
          itemName: '금융기관 전세자금대출 및 담보제공 확인서',
          sortOrder: 1,
          defaultIncluded: true,
          groupId: null,
          groupName: null,
          groupSortOrder: null,
        },
        {
          itemId: 2,
          itemName: '확정일자부 전세계약서',
          sortOrder: 2,
          defaultIncluded: true,
          groupId: null,
          groupName: null,
          groupSortOrder: null,
        },
        {
          itemId: 3,
          itemName: '전입세대확인서',
          sortOrder: 3,
          defaultIncluded: true,
          groupId: null,
          groupName: null,
          groupSortOrder: null,
        },
      ],
    },
    ADDITIONAL: {
      productCode: 'GENERAL',
      productName: '일반 반환보증',
      sectionCode: 'ADDITIONAL',
      sectionName: '추가서류',
      items: [
        { itemId: 19, itemName: '단독·다중·다가구주택', sortOrder: 1, defaultIncluded: true, groupId: 3, groupName: '주택유형별', groupSortOrder: 1 },
        { itemId: 18, itemName: '주거용 오피스텔', sortOrder: 2, defaultIncluded: true, groupId: 3, groupName: '주택유형별', groupSortOrder: 1 },
        { itemId: 17, itemName: '노인복지주택', sortOrder: 3, defaultIncluded: false, groupId: 3, groupName: '주택유형별', groupSortOrder: 1 },
        { itemId: 16, itemName: '임대인이 법인인 경우', sortOrder: 1, defaultIncluded: false, groupId: 2, groupName: '상황별', groupSortOrder: 2 },
        { itemId: 15, itemName: '임차인이 법인인 경우', sortOrder: 2, defaultIncluded: false, groupId: 2, groupName: '상황별', groupSortOrder: 2 },
        { itemId: 13, itemName: '임대인의 대리인과 계약한 경우', sortOrder: 4, defaultIncluded: false, groupId: 2, groupName: '상황별', groupSortOrder: 2 },
        { itemId: 12, itemName: '대한민국 국적 임대인이 해외 거주하는 경우', sortOrder: 5, defaultIncluded: false, groupId: 2, groupName: '상황별', groupSortOrder: 2 },
        { itemId: 11, itemName: '임대인이 외국인인 경우', sortOrder: 6, defaultIncluded: false, groupId: 2, groupName: '상황별', groupSortOrder: 2 },
        { itemId: 10, itemName: '감정평가금액으로 심사받고자 하는 경우', sortOrder: 1, defaultIncluded: false, groupId: 1, groupName: '기타 외 추가서류', groupSortOrder: 3 },
        { itemId: 9, itemName: '소유권보존등기만 이루어진 신규 분양 아파트인 경우', sortOrder: 2, defaultIncluded: false, groupId: 1, groupName: '기타 외 추가서류', groupSortOrder: 3 },
        { itemId: 8, itemName: '지정인 보증가입 사실 통지 서비스를 신청하고자 하는 경우', sortOrder: 3, defaultIncluded: false, groupId: 1, groupName: '기타 외 추가서류', groupSortOrder: 3 },
      ],
    },
    DISCOUNT: {
      productCode: 'GENERAL',
      productName: '일반 반환보증',
      sectionCode: 'DISCOUNT',
      sectionName: '보증료 할인 서류',
      items: [],
    },
  },
  SPECIAL: {
    BASIC: {
      productCode: 'SPECIAL',
      productName: '특례 반환보증',
      sectionCode: 'BASIC',
      sectionName: '기본서류',
      items: [
        { itemId: 101, itemName: '확정일자부 전세계약서', sortOrder: 1, defaultIncluded: true, groupId: null, groupName: null, groupSortOrder: null },
        { itemId: 102, itemName: '전입세대확인서', sortOrder: 2, defaultIncluded: true, groupId: null, groupName: null, groupSortOrder: null },
      ],
    },
    ADDITIONAL: {
      productCode: 'SPECIAL',
      productName: '특례 반환보증',
      sectionCode: 'ADDITIONAL',
      sectionName: '추가서류',
      items: [],
    },
    DISCOUNT: {
      productCode: 'SPECIAL',
      productName: '특례 반환보증',
      sectionCode: 'DISCOUNT',
      sectionName: '보증료 할인 서류',
      items: [
        { itemId: 103, itemName: '특례 보증료 할인 대상', sortOrder: 1, defaultIncluded: false, groupId: null, groupName: null, groupSortOrder: null },
      ],
    },
  },
};

function createDocumentResponse(productCode, itemId, itemName, documents) {
  return { productCode, itemId, itemName, documents };
}

function createDocument(documentId, documentName, description, sortOrder = 1, group = null) {
  return {
    documentId,
    documentName,
    description,
    sampleImageUrl: null,
    sortOrder,
    documentGroupId: group?.documentGroupId ?? null,
    documentGroupName: group?.documentGroupName ?? null,
    documentGroupSortOrder: group?.documentGroupSortOrder ?? null,
  };
}

// 실제 GET /api/products/{productCode}/checklist/items/{itemId}/documents 응답 형태를 따른다.
export const mockItemDocuments = {
  1: createDocumentResponse('GENERAL', 1, '금융기관 전세자금대출 및 담보제공 확인서', [
    createDocument(
      1,
      '금융기관 전세자금대출 및 담보제공 확인서',
      '임차인의 전세자금대출 이용 여부와 전세보증금에 대한 담보제공 여부 확인',
    ),
  ]),
  2: createDocumentResponse('GENERAL', 2, '확정일자부 전세계약서', [
    createDocument(2, '확정일자부 전세계약서', '확정일자와 계약 형태를 확인하는 계약 서류'),
  ]),
  3: createDocumentResponse('GENERAL', 3, '전입세대확인서', [
    createDocument(3, '전입세대확인서', '선순위 전입 세대를 확인하는 서류'),
  ]),
  19: createDocumentResponse('GENERAL', 19, '단독·다중·다가구주택', [
    createDocument(19, '건축물대장', '주택 유형과 위반건축물 여부를 확인하는 서류'),
  ]),
  18: createDocumentResponse('GENERAL', 18, '주거용 오피스텔', [
    createDocument(18, '중개대상물 확인설명서', '주거용 오피스텔 이용 상태를 확인하는 서류'),
  ]),
  17: createDocumentResponse('GENERAL', 17, '노인복지주택', []),
  16: createDocumentResponse('GENERAL', 16, '임대인이 법인인 경우', [
    createDocument(16, '법인등기사항전부증명서', '임대인 법인의 정보를 확인하는 서류'),
  ]),
  15: createDocumentResponse('GENERAL', 15, '임차인이 법인인 경우', []),
  13: createDocumentResponse('GENERAL', 13, '임대인의 대리인과 계약한 경우', []),
  12: createDocumentResponse('GENERAL', 12, '대한민국 국적 임대인이 해외 거주하는 경우', []),
  11: createDocumentResponse('GENERAL', 11, '임대인이 외국인인 경우', []),
  10: createDocumentResponse('GENERAL', 10, '감정평가금액으로 심사받고자 하는 경우', [
    createDocument(
      20,
      '감정평가서 원본',
      '감정평가금액을 적용하여 보증심사를 신청하기 위해 제출',
      1,
      { documentGroupId: 10, documentGroupName: '감정평가 신청서', documentGroupSortOrder: 1 },
    ),
    createDocument(
      21,
      '감정평가서 사본',
      '감정평가금액을 적용하여 보증심사를 신청하기 위해 제출',
      2,
      { documentGroupId: 10, documentGroupName: '감정평가 신청서', documentGroupSortOrder: 1 },
    ),
  ]),
  9: createDocumentResponse('GENERAL', 9, '소유권보존등기만 이루어진 신규 분양 아파트인 경우', []),
  8: createDocumentResponse('GENERAL', 8, '지정인 보증가입 사실 통지 서비스를 신청하고자 하는 경우', []),
  101: createDocumentResponse('SPECIAL', 101, '확정일자부 전세계약서', [
    createDocument(101, '확정일자부 전세계약서', '특례 보증의 계약 내용을 확인하는 서류'),
  ]),
  102: createDocumentResponse('SPECIAL', 102, '전입세대확인서', [
    createDocument(102, '전입세대확인서', '선순위 전입 세대를 확인하는 서류'),
  ]),
  103: createDocumentResponse('SPECIAL', 103, '특례 보증료 할인 대상', []),
};
