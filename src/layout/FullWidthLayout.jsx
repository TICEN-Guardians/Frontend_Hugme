import { Outlet } from 'react-router-dom';
import styles from './Layout.module.css';

/**
 * Layout과 동일하지만 main에 공통 컨테이너(--container-max)를 적용하지 않는다.
 * 랜딩 히어로, 로그인/회원가입 스플릿, 서류안내챗봇처럼 화면 폭 전체를 쓰는 페이지 전용.
 */
export default function FullWidthLayout() {
  return (
    <div className={`${styles.pageWrapper} ${styles.fullWidthPageWrapper}`}>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
