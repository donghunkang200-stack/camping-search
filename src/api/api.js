// src/api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // 프록시 또는 배포 서버에 맞게 조정
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      // 헤더에 Bearer 토큰 추가
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. API 서비스 함수들
export const apiService = {
  // 회원가입 요청
  async register(name, username, email, password) {
    try {
      const response = await api.post("/register", {
        name,
        username,
        email,
        password,
      });
      return response.data; // { "message": "...님 회원 가입성공!" }
    } catch (error) {
      // 서버에서 보낸 에러 메시지가 있으면 그것을 사용하고, 없으면 기본 메시지 사용
      const message =
        error.response?.data?.message || "회원가입에 실패했습니다.";
      throw new Error(message);
    }
  },

  // 로그인 요청
  async login(username, password) {
    try {
      const response = await api.post("/login", {
        username,
        password,
      });
      return response; // { "token": "..." }
    } catch (error) {
      throw new Error("아이디 또는 비밀번호가 틀렸습니다.");
    }
  },

  // (예시) 보호된 데이터를 가져오는 함수
  // 인터셉터 덕분에 헤더에 토큰을 따로 안넣어도 됩니다!
  async getDashboardData() {
    try {
      const response = await api.get("/dashboard/info");
      return response.data;
    } catch (error) {
      throw new Error("데이터를 불러오지 못했습니다.");
    }
  },
};

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response.data, // 항상 response.data 반환
  (error) => {
    console.error("API ERROR:", error);
    return Promise.reject(error);
  }
);

export default api;
