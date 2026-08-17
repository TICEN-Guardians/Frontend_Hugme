export const PRODUCT_CODES = {
  GENERAL: 'GENERAL', // 전세보증금반환보증
  SPECIAL: 'SPECIAL', // 특례반환보증
};

export const PRODUCT_THEME = {
  GENERAL: 'general', // 블루
  SPECIAL: 'special', // 그린
};

export const PRODUCT_ROUTE_TYPES = {
  RETURN: 'return',
  SPECIAL: 'special',
};

export const PRODUCT_ROUTE_TO_CODE = {
  [PRODUCT_ROUTE_TYPES.RETURN]: PRODUCT_CODES.GENERAL,
  [PRODUCT_ROUTE_TYPES.SPECIAL]: PRODUCT_CODES.SPECIAL,
  [PRODUCT_CODES.GENERAL]: PRODUCT_CODES.GENERAL,
  [PRODUCT_CODES.SPECIAL]: PRODUCT_CODES.SPECIAL,
};

export const PRODUCT_DETAIL_PATH = {
  [PRODUCT_CODES.GENERAL]: `/guarantee-checklist/${PRODUCT_ROUTE_TYPES.RETURN}`,
  [PRODUCT_CODES.SPECIAL]: `/guarantee-checklist/${PRODUCT_ROUTE_TYPES.SPECIAL}`,
};

export const GUARANTEE_THEME = {
  [PRODUCT_CODES.GENERAL]: {
    theme: PRODUCT_THEME.GENERAL,
    primary: '#0F75BD',
    soft: '#F2F8FC',
  },
  [PRODUCT_CODES.SPECIAL]: {
    theme: PRODUCT_THEME.SPECIAL,
    primary: '#3E9A43',
    soft: '#F3F8F3',
  },
};
