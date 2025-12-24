import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import { ToastContainer } from "react-toastify";

// 기존 페이지들
import CampingList from "./pages/CampingList";
import CampingDetail from "./pages/CampingDetail";

// 새 인증 페이지들
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";

// 1. 보호된 라우트 (인증이 필요한 캠핑 상세페이지 등에 사용)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// 2. 로그인된 사용자가 접근 시 리다이렉트 (로그인/가입 페이지 등)
const AuthRedirect = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/camping" replace /> : <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* 누구나 볼 수 있는 페이지 */}
      <Route path="/" element={<HomePage />} />
      <Route path="/camping" element={<CampingList />} />

      {/* 로그인이 필요한 캠핑 상세 페이지 */}
      <Route
        path="/detail/:id"
        element={
          <ProtectedRoute>
            <CampingDetail />
          </ProtectedRoute>
        }
      />

      {/* 로그인 및 회원가입 */}
      <Route
        path="/login"
        element={
          <AuthRedirect>
            <LoginPage />
          </AuthRedirect>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRedirect>
            <RegisterPage />
          </AuthRedirect>
        }
      />

      {/* 마이페이지/대시보드 */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  // 기존 프로젝트의 카카오맵 SDK 로드 로직
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
      import.meta.env.VITE_KAKAO_JS_KEY
    }&libraries=services&autoload=false`;

    script.onload = () => {
      window.kakao.maps.load(() => {
        console.log("Kakao Map SDK Loaded");
      });
    };
    document.head.appendChild(script);
  }, []);

  return (
    <Router>
      <AuthProvider>
        {" "}
        {/* 모든 인증 상태를 하위 컴포넌트에 공급 */}
        <Layout>
          {" "}
          {/* 상단바나 푸터를 포함한 전체 레이아웃 */}
          <AppRoutes />
        </Layout>
        <ToastContainer position="top-center" autoClose={3000} theme="light" />
      </AuthProvider>
    </Router>
  );
};

export default App;
