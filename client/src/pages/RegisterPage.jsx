import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "../api/api";
import { toast } from "react-toastify";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * 회원가입 폼 제출 핸들러
   * 새로운 사용자 정보를 백엔드에 등록합니다.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // apiService.register 함수를 호출하여 사용자 등록을 시도합니다.
      // 이름과 이메일도 백엔드에서 필수로 요구하므로 함께 전송합니다.
      await apiService.register({ name, username, email, password });
      // 회원가입 성공 시 축하 메시지를 띄우고 로그인 페이지로 유도합니다.
      toast.success("회원가입이 완료되었습니다! 로그인해주세요.");
      navigate("/login");
    } catch (err) {
      // 오류 발생 시 에러 메시지를 사용자에게 표시합니다.
      toast.error(err.message || "회원가입에 실패했습니다.");
    } finally {
      // 로딩 상태를 해제합니다.
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-5">
      <div className="bg-white p-10 rounded-4xl shadow-[0_20px_50px_rgba(46,79,47,0.1)] border border-primary-100">
        <div className="text-center mb-8">
          <span className="text-4xl mb-3 block">🌿</span>
          <h2 className="text-3xl font-black text-primary-800">대원 모집</h2>
          <p className="text-gray-500 mt-2 font-medium">
            캠핑가자의 새로운 가족이 되어주세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-primary-600 mb-1.5 uppercase tracking-[0.15em] ml-1">
              이름
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-3.5 rounded-2xl bg-surface-bg border-2 border-transparent focus:border-primary-600 focus:bg-white focus:ring-0 transition-all outline-none placeholder:text-gray-300"
              placeholder="본명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-primary-600 mb-1.5 uppercase tracking-[0.15em] ml-1">
              아이디
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-3.5 rounded-2xl bg-surface-bg border-2 border-transparent focus:border-primary-600 focus:bg-white focus:ring-0 transition-all outline-none placeholder:text-gray-300"
              placeholder="사용할 아이디"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-primary-600 mb-1.5 uppercase tracking-[0.15em] ml-1">
              이메일
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-3.5 rounded-2xl bg-surface-bg border-2 border-transparent focus:border-primary-600 focus:bg-white focus:ring-0 transition-all outline-none placeholder:text-gray-300"
              placeholder="example@mail.com"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-primary-600 mb-1.5 uppercase tracking-[0.15em] ml-1">
              비밀번호
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-3.5 rounded-2xl bg-surface-bg border-2 border-transparent focus:border-primary-600 focus:bg-white focus:ring-0 transition-all outline-none placeholder:text-gray-300"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 text-white font-black rounded-2xl shadow-[0_10px_20px_rgba(75,107,75,0.2)] transition-all flex justify-center items-center gap-2 ${
                loading
                  ? "bg-primary-500 opacity-70 cursor-not-allowed"
                  : "bg-primary-600 hover:bg-primary-800 hover:-translate-y-1 active:scale-[0.98]"
              }`}
            >
              {loading ? "텐트 치는 중..." : "가입 완료하기"}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-primary-50 text-center">
          <p className="text-gray-400 text-sm font-medium">
            이미 계정이 있으신가요?{" "}
            <Link
              to="/login"
              className="text-primary-600 font-bold hover:text-primary-800 underline underline-offset-4"
            >
              로그인하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;
