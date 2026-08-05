import { NavLink, Route, Routes } from 'react-router-dom';
import styles from './AiChatPage.module.css';
import ConditionChat from './ConditionChat.jsx';
import DocumentChat from './DocumentChat.jsx';

export default function AiChatPage() {
  return (
    <main className={styles.root}>
      <h1>Ai 챗봇 페이지</h1>
      <nav className={styles.nav}>
        <NavLink className={styles.link} to="document">
          서류 안내 상담
        </NavLink>
        <NavLink className={styles.link} to="condition">
          조건 상담
        </NavLink>
      </nav>
      <Routes>
        <Route index element={<DocumentChat />} />
        <Route path="document" element={<DocumentChat />} />
        <Route path="condition" element={<ConditionChat />} />
      </Routes>
    </main>
  );
}
