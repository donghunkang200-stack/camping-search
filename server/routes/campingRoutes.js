// server/routes/campingRoutes.js
import express from "express";
import {
    getAllCamping,
    searchCamping,
    getCampingDetail,
    getNearbyCamping
} from "../controllers/campingController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// 모든 캠핑 경로는 로그인 토큰 인증이 필요합니다.
router.use(authenticateToken);

// 1. 전체 캠핑장 목록 조회
router.get("/all", getAllCamping);

// 2. 키워드 검색
router.get("/search", searchCamping);

// 3. 상세 정보 조회
router.get("/detail/:id", getCampingDetail);

// 4. 주변 캠핑장 조회 (좌표기반)
router.get("/nearby", getNearbyCamping);

export default router;
