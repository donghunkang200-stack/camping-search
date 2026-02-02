// server/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import campingRoutes from "./routes/campingRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 0. MongoDB 연결 설정
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB 연결 성공!"))
  .catch((err) => console.error("❌ MongoDB 연결 실패:", err));

// 1. 공통 미들웨어 설정
// CORS 설정: Netlify 배포 도메인 및 로컬 개발(Dev) 도메인 허용, preflight(OPTIONS) 처리
const allowedOrigins = ["https://camping-go.netlify.app"];
if (process.env.NODE_ENV !== "production") {
  // 개발 중 로컬 Vite 서버에서 테스트할 때 사용 (http://localhost:5173)
  allowedOrigins.push("http://localhost:5173");
}
const corsOptions = {
  origin: (origin, callback) => {
    // 브라우저의 Origin 헤더가 없을 때(예: 서버 내부 호출)도 허용
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200, // 일부 구형 브라우저에서 204를 처리하지 못하는 문제 방지
  // credentials: true, // 쿠키/인증이 필요하면 주석 해제하고 클라이언트에서 withCredentials 설정
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

// 1.5. 서버 상태 확인용 (Health Check)
app.get("/", (req, res) => {
  res.send("Hello! Camping Server is running correctly. 🚀");
});

// 2. 통합 백엔드 라우터 연결
// - 인증 관련 (/api/register, /api/login)
app.use("/api", authRoutes);

// - 캠핑 데이터 관련 (/api/camping/all 등)
app.use("/api/camping", campingRoutes);

// 3. 서버 포트 실행
app.listen(PORT, () =>
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`),
);
