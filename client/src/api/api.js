// src/api/api.js
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

/**
 * 1. Axios 인스턴스 설정
 * 모든 API 요청의 기본 URL과 가로채기(Interceptor) 로직을 정의합니다.
 */
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE || ""}/api`, // 환경 변수(http://localhost:5000) 뒤에 /api 추가
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 가로채기: 모든 요청 헤더에 JWT 토큰을 자동으로 추가합니다.
api.interceptors.request.use(
  (config) => {
    // Zustand 스토어에서 최신 토큰을 가져옵니다.
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 서버에서 인증할 수 있도록 Bearer 토큰 삽입
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 가로채기: 서버 응답 객체에서 데이터만 추출하여 반환합니다.
api.interceptors.response.use(
  (response) => {
    // Axios의 response.data가 실제 서버에서 보낸 JSON 바디입니다.
    return response.data;
  },
  (error) => {
    // 에러 발생 시 공통 에러 메시지 처리
    const message = error.response?.data?.message || error.message || "요청 중 오류가 발생했습니다.";
    return Promise.reject(new Error(message));
  }
);

/**
 * 2. 공통 인증 서비스
 * 회원가입 및 로그인 요청을 담당합니다.
 */
export const apiService = {
  // 로그인 요청
  login: async (username, password) => {
    return api.post("/login", { username, password });
  },
  // 회원가입 요청
  register: async (username, password) => {
    return api.post("/register", { username, password });
  },
};

export default api;
