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
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB 연결 성공!"))
  .catch((err) => console.error("❌ MongoDB 연결 실패:", err));

// 1. 공통 미들웨어 설정
app.use(cors());
app.use(express.json());

// 2. 통합 백엔드 라우터 연결
// - 인증 관련 (/api/register, /api/login)
app.use("/api", authRoutes);

// - 캠핑 데이터 관련 (/api/camping/all 등)
app.use("/api/camping", campingRoutes);

// 3. 서버 포트 실행
app.listen(PORT, () => console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`));
