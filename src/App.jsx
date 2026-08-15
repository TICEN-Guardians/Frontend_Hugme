import { Route, Routes } from 'react-router-dom';
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
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:productCode/checklist" element={<ProductChecklistPage />} />
        <Route path="/doc-chat" element={<DocumentChat />} />
        <Route path="/user-chat" element={<ConditionChat />} />
        <Route path="/risk/new" element={<RiskFormPage />} />
        <Route path="/risk/:reportId" element={<RiskReportPage />} />
        <Route path="/main" element={<MainPage />} />
      </Route>
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}
