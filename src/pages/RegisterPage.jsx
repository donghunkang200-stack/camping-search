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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiService.register(
        name,
        username,
        email,
        password
      );
      toast.success(response.message || "가입이 완료되었습니다!");
      navigate("/login");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-5">
      <div className="bg-white p-10 rounded-[32px] shadow-[0_20px_50px_rgba(46,79,47,0.1)] border border-[#e9eee9]">
        <div className="text-center mb-8">
          <span className="text-4xl mb-3 block">🌿</span>
          <h2 className="text-3xl font-black text-[#2e4f2f]">대원 모집</h2>
          <p className="text-gray-500 mt-2 font-medium">
            캠핑가자의 새로운 가족이 되어주세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#4b6b4b] mb-1.5 uppercase tracking-[0.15em] ml-1">
              이름
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-3.5 rounded-2xl bg-[#fafafa] border-2 border-transparent focus:border-[#4b6b4b] focus:bg-white focus:ring-0 transition-all outline-none placeholder:text-gray-300"
              placeholder="본명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#4b6b4b] mb-1.5 uppercase tracking-[0.15em] ml-1">
              아이디
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-3.5 rounded-2xl bg-[#fafafa] border-2 border-transparent focus:border-[#4b6b4b] focus:bg-white focus:ring-0 transition-all outline-none placeholder:text-gray-300"
              placeholder="사용할 아이디"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#4b6b4b] mb-1.5 uppercase tracking-[0.15em] ml-1">
              이메일
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-3.5 rounded-2xl bg-[#fafafa] border-2 border-transparent focus:border-[#4b6b4b] focus:bg-white focus:ring-0 transition-all outline-none placeholder:text-gray-300"
              placeholder="example@mail.com"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#4b6b4b] mb-1.5 uppercase tracking-[0.15em] ml-1">
              비밀번호
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-3.5 rounded-2xl bg-[#fafafa] border-2 border-transparent focus:border-[#4b6b4b] focus:bg-white focus:ring-0 transition-all outline-none placeholder:text-gray-300"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 bg-[#4b6b4b] text-white font-black rounded-2xl shadow-[0_10px_20px_rgba(75,107,75,0.2)] transition-all flex justify-center items-center gap-2 ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-[#3d5a3d] hover:-translate-y-1 active:scale-[0.98]"
              }`}
            >
              {loading ? "텐트 치는 중..." : "가입 완료하기"}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-400 text-sm font-medium">
            이미 계정이 있으신가요?{" "}
            <Link
              to="/login"
              className="text-[#4b6b4b] font-bold hover:text-[#2e4f2f] underline underline-offset-4"
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
