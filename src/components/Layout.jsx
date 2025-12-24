import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const Layout = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#faf8f3]">
      {" "}
      {/* 배경색 통일 */}
      <nav className="bg-white border-b border-[#e9eee9] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex justify-between h-20 items-center">
          {" "}
          {/* 높이 살짝 키움 */}
          {/* 로고 영역 */}
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-black text-[#2e4f2f] tracking-tighter"
          >
            <span className="text-2xl">✨🔥</span> 캠핑가자
          </Link>
          {/* 메뉴 영역 */}
          <div className="flex items-center gap-8 text-sm font-bold">
            {/* 캠핑장 찾기는 항상 노출 */}
            <Link
              to="/camping"
              className="text-[#4b6b4b] hover:text-[#5cd16b] transition-colors flex items-center gap-1"
            >
              캠핑장 찾기
            </Link>

            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-4 border-l border-gray-200 pl-8">
                  <span className="text-gray-600 hidden sm:inline">
                    <span className="text-[#4b6b4b] font-bold">
                      {user?.username}
                    </span>
                    님 환영합니다
                  </span>
                  <Link
                    to="/dashboard"
                    className="text-gray-500 hover:text-[#4b6b4b] transition-colors"
                  >
                    대시보드
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-[#f1f5f1] text-[#4b6b4b] px-4 py-2 rounded-lg hover:bg-[#e4eee4] transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-[#4b6b4b] transition-colors"
                >
                  로그인
                </Link>
                <Link
                  to="/register"
                  className="bg-[#4b6b4b] text-white px-6 py-2.5 rounded-xl hover:bg-[#3d5a3d] transition-all shadow-md active:scale-95"
                >
                  시작하기
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      {/* 메인 컨텐츠 */}
      <main className="grow container mx-auto px-4 py-12">{children}</main>
      {/* 푸터 */}
      <footer className="bg-white border-t border-[#e9eee9] py-10 text-center">
        <p className="text-[#2e4f2f] font-bold mb-2">🏕️ 캠핑가자</p>
        <p className="text-gray-400 text-xs tracking-widest uppercase">
          &copy; {new Date().getFullYear()} Spring Boot & React Project
        </p>
      </footer>
    </div>
  );
};
