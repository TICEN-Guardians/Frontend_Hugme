import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import FloatingChatWidget from './components/floatingChat/FloatingChatWidget.jsx';
import { useAuth } from './context/auth/AuthContext.jsx';
import { GuideChatProvider } from './context/guideChat/GuideChatContext.jsx';
import FullWidthLayout from './layout/FullWidthLayout.jsx';
import Layout from './layout/Layout.jsx';
import ConditionChat from './pages/Chat/ConditionChat/ConditionChat.jsx';
import DocumentChat from './pages/Chat/DocumentChat/DocumentChat.jsx';
import ErrorPage from './pages/ErrorPage/ErrorPage.jsx';
import LandingPage from './pages/LandingPage/LandingPage.jsx';
import KakaoMessageCallbackPage from './pages/KakaoMessageCallbackPage/KakaoMessageCallbackPage.jsx';
import LoginPage from './pages/LoginPage/LoginPage.jsx';
import MainPage from './pages/MainPage/MainPage.jsx';
import EmailVerifyPage from './pages/EmailVerifyPage/EmailVerifyPage.jsx';
import ProductChecklistPage from './pages/ProductChecklistPage/ProductChecklistPage.jsx';
import ProductsPage from './pages/ProductsPage/ProductsPage.jsx';
import RiskFormPage from './pages/RiskFormPage/RiskFormPage.jsx';
import RiskReportPage from './pages/RiskReportPage/RiskReportPage.jsx';
import SignupPage from './pages/SignupPage/SignupPage.jsx';

function ProtectedRoute() {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <GuideChatProvider>
      <Routes>
        {/* 화면 폭 전체를 쓰는 예외 페이지 */}
        {/* 배경(히어로/스플릿)만 풀블리드가 필요한 예외 페이지. 콘텐츠 자체는 각 페이지가
          스스로 max-width로 가운데 정렬한다 (히어로 텍스트, 로그인/회원가입 폼 등). */}
        <Route element={<FullWidthLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/auth/mail/verify" element={<EmailVerifyPage />} />
          <Route path="/api/auth/mail/verify" element={<EmailVerifyPage />} />
        </Route>

        {/* 로그인 이후 서비스 화면은 헤더 대신 공통 사이드바를 사용한다. */}
        <Route element={<Layout />}>
          <Route path="/risk/new" element={<RiskFormPage />} />
          <Route path="/risk/:reportId" element={<RiskReportPage />} />
          <Route path="/guarantee-checklist" element={<ProductsPage />} />
          <Route path="/guarantee-checklist/:guaranteeType" element={<ProductChecklistPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:productCode/checklist" element={<ProductChecklistPage />} />
          <Route path="/user-chat" element={<ConditionChat />} />
          <Route path="/main" element={<MainPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/doc-chat" element={<DocumentChat />} />
            <Route path="/oauth/kakao/message/callback" element={<KakaoMessageCallbackPage />} />
          </Route>
        </Route>

        <Route path="*" element={<ErrorPage />} />
      </Routes>
      <FloatingChatWidget />
    </GuideChatProvider>
  );
}
