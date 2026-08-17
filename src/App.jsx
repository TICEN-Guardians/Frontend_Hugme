import { Route, Routes } from 'react-router-dom';
import FullWidthLayout from './layout/FullWidthLayout.jsx';
import Layout from './layout/Layout.jsx';
import ConditionChat from './pages/Chat/ConditionChat/ConditionChat.jsx';
import DocumentChat from './pages/Chat/DocumentChat/DocumentChat.jsx';
import ErrorPage from './pages/ErrorPage/ErrorPage.jsx';
import LandingPage from './pages/LandingPage/LandingPage.jsx';
import LoginPage from './pages/LoginPage/LoginPage.jsx';
import MainPage from './pages/MainPage/MainPage.jsx';
import ProductChecklistPage from './pages/ProductChecklistPage/ProductChecklistPage.jsx';
import ProductsPage from './pages/ProductsPage/ProductsPage.jsx';
import RiskFormPage from './pages/RiskFormPage/RiskFormPage.jsx';
import RiskReportPage from './pages/RiskReportPage/RiskReportPage.jsx';
import SignupPage from './pages/SignupPage/SignupPage.jsx';

export default function App() {
  return (
    <Routes>
      {/* 화면 폭 전체를 쓰는 예외 페이지 */}
      {/* 배경(히어로/스플릿)만 풀블리드가 필요한 예외 페이지. 콘텐츠 자체는 각 페이지가
          스스로 max-width로 가운데 정렬한다 (히어로 텍스트, 로그인/회원가입 폼 등). */}
      <Route element={<FullWidthLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        {/* 회색 배경을 뷰포트 끝까지 채우고, 안쪽 콘텐츠만 자체적으로 container를 적용 */}
        <Route path="/risk/new" element={<RiskFormPage />} />
        <Route path="/risk/:reportId" element={<RiskReportPage />} />
      </Route>

      {/* 공통 컨테이너(--container-max)로 폭을 맞추는 일반 페이지 */}
      <Route element={<Layout />}>
        <Route path="/guarantee-checklist" element={<ProductsPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:productCode/checklist" element={<ProductChecklistPage />} />
        <Route path="/doc-chat" element={<DocumentChat />} />
        <Route path="/user-chat" element={<ConditionChat />} />
        <Route path="/main" element={<MainPage />} />
      </Route>

      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}
