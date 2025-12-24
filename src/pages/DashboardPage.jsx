import { useAuth } from "../contexts/AuthContext";

const DashboardPage = () => {
  const { user, token } = useAuth();
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 text-white shadow-xl">
        <h1 className="text-3xl font-black mb-2">
          {user?.username}님, 반갑습니다!
        </h1>
        <p className="opacity-80 font-medium">
          현재 로그인 상태이며, 대시보드 기능을 이용하실 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
            내 계정 정보
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">사용자 이름</span>
              <span className="font-bold">{user?.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">계정 상태</span>
              <span className="text-green-500 font-bold">인증됨</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
            보안 토큰 (JWT)
          </h3>
          <div className="bg-gray-50 p-4 rounded-xl text-[10px] font-mono break-all text-gray-400 line-clamp-3 leading-relaxed">
            {token}
          </div>
          <p className="mt-4 text-[11px] text-gray-400 italic font-medium">
            * 이 토큰은 백엔드 API 요청 시 헤더에 포함되어 신원을 증명합니다.
          </p>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
