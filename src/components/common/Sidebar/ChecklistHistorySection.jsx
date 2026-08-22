import { useEffect, useState } from 'react';
import { FaListCheck } from 'react-icons/fa6';
import { useLocation } from 'react-router-dom';
import { getCompletedApplications } from '../../../api/checklist/checklistService.js';
import { PRODUCT_DETAIL_PATH } from '../../../constants/products.js';
import { useAuth } from '../../../context/auth/AuthContext.jsx';
import {
  CHECKLIST_COMPLETED_EVENT,
  LAST_DOCUMENT_CHAT_APPLICATION_ID_KEY,
} from '../../../hooks/useContractUpload.js';
import styles from './Sidebar.module.css';

const PRODUCT_LABEL = {
  GENERAL: '일반 반환보증',
  SPECIAL: '특례 반환보증',
};

const isChecklistPath = (pathname) =>
  pathname === '/guarantee-checklist' ||
  pathname.startsWith('/guarantee-checklist/') ||
  (pathname.startsWith('/products/') && pathname.endsWith('/checklist'));

export default function ChecklistHistorySection() {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { pathname } = useLocation();
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || !isChecklistPath(pathname)) {
      setApplications([]);
      return undefined;
    }

    let ignore = false;

    const fetchApplications = () => {
      getCompletedApplications()
        .then((result) => {
          if (!ignore) setApplications(result);
        })
        .catch(() => {
          if (!ignore) setApplications([]);
        });
    };

    fetchApplications();
    window.addEventListener(CHECKLIST_COMPLETED_EVENT, fetchApplications);

    return () => {
      ignore = true;
      window.removeEventListener(CHECKLIST_COMPLETED_EVENT, fetchApplications);
    };
  }, [isAuthenticated, isAuthLoading, pathname]);

  if (
    isAuthLoading ||
    !isAuthenticated ||
    !isChecklistPath(pathname) ||
    applications.length === 0
  ) {
    return null;
  }

  const rememberApplication = (applicationId) => {
    try {
      sessionStorage.setItem(
        LAST_DOCUMENT_CHAT_APPLICATION_ID_KEY,
        String(applicationId),
      );
    } catch {
      // URL의 applicationId로도 복원하므로 저장소 사용이 막혀 있어도 이동은 계속한다.
    }
  };

  return (
    <div className={styles.checklistHistoryList}>
      {applications.map((application) => (
        <a
          key={application.applicationId}
          className={styles.historyItemButton}
          data-product-code={application.productCode}
          href={`${PRODUCT_DETAIL_PATH[application.productCode] ?? pathname}?applicationId=${application.applicationId}`}
          onClick={() => rememberApplication(application.applicationId)}
        >
          <span className={styles.historyIcon} aria-hidden="true">
            <FaListCheck />
          </span>
          <span className={styles.historyText}>
            <strong>{application.contractAddress || '계약 주소 없음'}</strong>
            <small>
              {PRODUCT_LABEL[application.productCode] || '보증 체크리스트'}
              {application.updatedAt ? ` · ${application.updatedAt}` : ''}
            </small>
          </span>
        </a>
      ))}
    </div>
  );
}
