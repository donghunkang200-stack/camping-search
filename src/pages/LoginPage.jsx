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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiService.login(username, password);
      // 응답 구조에 따라 대응 (data.token 인지 response.token 인지 확인)
      const token = response?.token || response?.data?.token;
      if (token) {
        login(token, username);
        toast.success("성공적으로 로그인했습니다!");
        navigate("/camping"); // 대시보드 대신 캠핑 페이지로 이동하도록 수정
      } else {
        throw new Error("서버 응답에 인증 토큰이 없습니다.");
      }
      //   login(data.token, username);
      //   toast.success("성공적으로 로그인했습니다!");
      //   navigate("/dashboard");
    } catch (err) {
      console.error("로그인 상세 에러:", err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-10">
      <div className="bg-white p-10 rounded-[32px] shadow-[0_20px_50px_rgba(46,79,47,0.1)] border border-[#e9eee9]">
        <div className="text-center mb-10">
          <span className="text-4xl mb-4 block">✈</span>
          <h2 className="text-3xl font-black text-[#2e4f2f]">
            어서오세요 대원님!
          </h2>
          <p className="text-gray-500 mt-2 font-medium">
            캠핑가자 계정으로 로그인하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-[#4b6b4b] mb-2 uppercase tracking-[0.15em] ml-1">
              아이디
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-[#fafafa] border-2 border-transparent focus:border-[#4b6b4b] focus:bg-white focus:ring-0 transition-all outline-none placeholder:text-gray-300"
              placeholder="아이디를 입력하세요"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#4b6b4b] mb-2 uppercase tracking-[0.15em] ml-1">
              비밀번호
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-[#fafafa] border-2 border-transparent focus:border-[#4b6b4b] focus:bg-white focus:ring-0 transition-all outline-none placeholder:text-gray-300"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 bg-[#4b6b4b] text-white font-black rounded-2xl shadow-[0_10px_20px_rgba(75,107,75,0.2)] transition-all flex justify-center items-center gap-2 ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-[#3d5a3d] hover:-translate-y-1 active:scale-[0.98]"
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

        <div className="mt-10 pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-400 text-sm font-medium">
            아직 대원이 아니신가요?{" "}
            <Link
              to="/register"
              className="text-[#4b6b4b] font-bold hover:text-[#2e4f2f] underline underline-offset-4 decoration-2"
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
