import { Route, Routes } from 'react-router-dom';
import Layout from './layout/Layout.jsx';
import AiChatPage from './pages/AiChatPage/AiChatPage.jsx';
import ChecklistPage from './pages/ChecklistPage/ChecklistPage.jsx';
import LandingPage from './pages/LandingPage/LandingPage.jsx';
import LoginPage from './pages/LoginPage/LoginPage.jsx';
import MainPage from './pages/MainPage/MainPage.jsx';
import RiskDiagnosisPage from './pages/RiskDiagnosisPage/RiskDiagnosisPage.jsx';
import SignupPage from './pages/SignupPage/SignupPage.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/checklist" element={<ChecklistPage />} />
        <Route path="/chat/*" element={<AiChatPage />} />
        <Route path="/risk" element={<RiskDiagnosisPage />} />
        <Route path="/main" element={<MainPage />} />
      </Routes>
    </Layout>
  );
}
