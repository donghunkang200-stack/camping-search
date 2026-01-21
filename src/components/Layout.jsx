import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * 전체 서비스의 공통 레이아웃을 담당하는 컴포넌트입니다.
 * 모든 페이지에서 공통적으로 보여지는 헤더(네비게이션 바)와 푸터를 포함합니다.
 */
export const Layout = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * 로그아웃 처리 함수
   * 인증 상태를 초기화하고 로그인 페이지로 이동합니다.
   */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-surface-bg">
      {/* 🧭 상단 네비게이션 바 */}
      <nav className="bg-white border-b border-primary-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex justify-between h-20 items-center">
          {/* 로고 영역: 클릭 시 홈으로 이동 */}
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-black text-primary-800 tracking-tighter"
          >
            <span className="text-2xl">✨🔥</span> 캠핑가자
          </Link>
          {/* 메뉴 영역: 로그인 상태에 따라 다른 버튼을 표시 */}
          <div className="flex items-center gap-8 text-base font-bold">
            <Link
              to="/camping"
              className="text-primary-600 hover:text-primary-800 transition-colors flex items-center gap-1"
            >
              캠핑장 찾기
            </Link>

            {isAuthenticated ? (
              // 인증된 경우: 환영 메시지와 로그아웃 버튼 표시
              <div className="flex items-center gap-4 border-l border-primary-50 pl-8">
                <span className="text-gray-600 hidden sm:inline">
                  <span className="text-primary-600 font-bold">
                    {user?.username}
                  </span>
                  님 환영합니다
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-primary-50 text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              // 비인증 상태인 경우: 로그인 및 시작하기 버튼 표시
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-primary-600 transition-colors"
                >
                  로그인
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-6 py-2.5 rounded-xl hover:bg-primary-800 transition-all shadow-md active:scale-95"
                >
                  시작하기
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 🖼️ 메인 컨텐츠 영역: 각 페이지의 내용이 이곳에 렌더링됩니다. */}
      <main className="grow container mx-auto px-4 py-12">{children}</main>

      {/* <footer> 하단 푸터 영역 */}
      <footer className="bg-white border-t border-primary-100 py-10 text-center">
        <p className="text-primary-800 font-bold text-lg mb-2">🏕️ 캠핑가자</p>
        <p className="text-gray-400 text-sm tracking-widest uppercase">
          &copy; {new Date().getFullYear()} Spring Boot & React Project
        </p>
      </footer>
    </div>
  );
};
