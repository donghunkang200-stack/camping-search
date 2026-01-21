// src/api/api.js
import axios from "axios";

/**
 * 1. Axios 인스턴스 설정
 * 모든 API 요청의 기본 URL과 가로채기(Interceptor) 로직을 정의합니다.
 */
const api = axios.create({
  baseURL: "/api", // Vite 프록시 설정을 통해 백엔드 서버와 통신합니다.
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 가로채기: 모든 요청 헤더에 JWT 토큰을 자동으로 추가합니다.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 서버에서 인증할 수 있도록 Bearer 토큰 삽입
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 2. 공통 인증 서비스
 * 회원가입 및 로그인 요청을 담당합니다.
 */
export const apiService = {
  // 로그인 요청
  login: async (username, password) => {
    try {
      const response = await api.post("/login", { username, password });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "로그인에 실패했습니다.";
      throw new Error(message);
    }
  },
  // 회원가입 요청
  register: async (username, password) => {
    try {
      const response = await api.post("/register", { username, password });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "회원가입에 실패했습니다.";
      throw new Error(message);
    }
  },
};

export default api;
