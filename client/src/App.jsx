import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";
import { Layout } from "./components/Layout";
import { ToastContainer } from "react-toastify";
import ScrollToTop from "./components/ScrollToTop";
import CampingList from "./pages/CampingList";
import CampingDetail from "./pages/CampingDetail";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

/**
 * 1. 보호된 라우트 (ProtectedRoute)
 * 로그인이 완료된 사용자만 접근할 수 있도록 제한하는 래퍼 컴포넌트입니다.
 * 비로그인 사용자가 접근 시 로그인 페이지로 강제 이동시킵니다.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

/**
 * 2. 인증 리다이렉트 (AuthRedirect)
 * 이미 로그인된 사용자가 '로그인'이나 '회원가입' 페이지에 접근하려 할 때,
 * 자동으로 캠핑장 목록 페이지로 돌려보내는 기능입니다.
 */
const AuthRedirect = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/camping" replace /> : <>{children}</>;
};

/**
 * 3. 전체 애플리케이션 라우트 구성 (AppRoutes)
 * 각 경로(Path)마다 어떤 컴포넌트를 보여줄지 결정합니다.
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* 🏡 메인 홈 (누구나 접근 가능) */}
      <Route path="/" element={<HomePage />} />

      {/* 🔍 캠핑장 찾기 (로그인 필수) */}
      <Route
        path="/camping"
        element={
          <ProtectedRoute>
            <CampingList />
          </ProtectedRoute>
        }
      />
      {/* ⛺ 캠핑상세 (로그인 필수) */}
      <Route
        path="/detail/:id"
        element={
          <ProtectedRoute>
            <CampingDetail />
          </ProtectedRoute>
        }
      />

      {/* 🔐 인증 관련 페이지 */}
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

      {/* 정의되지 않은 경로는 모두 홈으로 이동 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/**
 * 4. 메인 App 컴포넌트
 * 카카오맵 SDK 로드 및 전역 Provider(Layout 등)를 초기화합니다.
 */
const App = () => {
  // 앱 실행 시 카카오맵 SDK를 동적으로 로드합니다.
  useEffect(() => {
    const script = document.createElement("script");
    // use explicit https scheme and include autoload=false
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_KEY}&libraries=services&autoload=false`;

    script.onload = () => {
      try {
        if (window.kakao && window.kakao.maps && typeof window.kakao.maps.load === "function") {
          window.kakao.maps.load(() => {
            window.__kakao_ready = true;
            console.log("Kakao Map SDK Loaded");
          });
        } else {
          // If maps API isn't immediately available, set a flag and let waitForKakao poll
          console.warn("Kakao script loaded but maps not ready yet");
        }
      } catch (err) {
        console.error("Error during Kakao maps.load():", err);
        window.__kakao_load_error = true;
      }
    };

    script.onerror = () => {
      console.error("Failed to load Kakao Maps SDK script");
      window.__kakao_load_error = true;
    };

    document.head.appendChild(script);

    // Cleanup: remove script if component unmounts
    return () => {
      try {
        document.head.removeChild(script);
      } catch (e) {
        // ignore
      }
    };
  }, []);

  return (
    <Router>
      {/* 페이지 이동 시마다 스크롤을 맨 위로 초기화 */}
      <ScrollToTop />
      {/* 전체 레이아웃 (네비게이션 바, 푸터 포함) */}
      <Layout>
        <AppRoutes />
      </Layout>
      {/* 전역 알림(토스트) 메시지 설정 */}
      <ToastContainer position="top-center" autoClose={3000} theme="light" />
    </Router>
  );
};

export default App;
