import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "../api/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  /**
   * 로그인 폼 제출 핸들러
   * 사용자 아이디와 비밀번호를 백엔드에 전달하여 토큰을 발급받습니다.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiService.login(username, password);
      // 백엔드 응답에서 JWT 토큰을 추출합니다.
      const token = response?.token || response?.data?.token;

      if (token) {
        // AuthContext의 login 함수를 사용하여 전역 상태를 업데이트합니다.
        login(token, username);
        toast.success("성공적으로 로그인했습니다!");
        // 로그인 성공 후 캠핑장 목록 페이지로 이동합니다.
        navigate("/camping");
      } else {
        throw new Error("서버 응답에 인증 토큰이 없습니다.");
      }
    } catch (err) {
      console.error("로그인 상세 에러:", err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-10">
      <div className="bg-white p-10 rounded-4xl shadow-[0_20px_50px_rgba(46,79,47,0.1)] border border-primary-100">
        <div className="text-center mb-10">
          <span className="text-4xl mb-4 block">✈</span>
          <h2 className="text-3xl font-black text-primary-800">
            어서오세요 대원님!
          </h2>
          <p className="text-gray-500 mt-2 font-medium">
            캠핑가자 계정으로 로그인하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-primary-600 mb-2 uppercase tracking-[0.15em] ml-1">
              아이디
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-surface-bg border-2 border-transparent focus:border-primary-600 focus:bg-white focus:ring-0 transition-all outline-none placeholder:text-gray-300"
              placeholder="아이디를 입력하세요"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-primary-600 mb-2 uppercase tracking-[0.15em] ml-1">
              비밀번호
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-surface-bg border-2 border-transparent focus:border-primary-600 focus:bg-white focus:ring-0 transition-all outline-none placeholder:text-gray-300"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 text-white font-black rounded-2xl shadow-[0_10px_20px_rgba(75,107,75,0.2)] transition-all flex justify-center items-center gap-2 ${loading
                ? "bg-primary-500 opacity-70 cursor-not-allowed"
                : "bg-primary-600 hover:bg-primary-800 hover:-translate-y-1 active:scale-[0.98]"
                }`}
            >
              {loading ? (
                "장작을 쌓는 중..."
              ) : (
                <>
                  로그인하기 <span className="text-lg"></span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-10 pt-8 border-t border-primary-50 text-center">
          <p className="text-gray-400 text-sm font-medium">
            아직 대원이 아니신가요?{" "}
            <Link
              to="/register"
              className="text-primary-600 font-bold hover:text-primary-800 underline underline-offset-4 decoration-2"
            >
              회원가입 하러가기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
