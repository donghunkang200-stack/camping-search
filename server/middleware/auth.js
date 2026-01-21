// server/middleware/auth.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "xkvosaifjaojflwejflwejlj123j12l3j11l";

/**
 * JWT 토큰 검증 미들웨어
 * 요청 헤더의 Authorization: Bearer <TOKEN> 형식을 확인합니다.
 */
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // "Bearer [Token]"에서 토큰부만 추출

    // 1. 토큰이 없는 경우 (401: Unauthorized)
    if (!token) {
        return res.status(401).json({ message: "인증 토큰이 누락되었습니다." });
    }

    // 2. 토큰 검증 및 사용자 객체 추출
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error("JWT 검증 실패:", err.message);
            // 토큰 만료 등 검증 실패 시 (403: Forbidden)
            return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
        }

        // 검증 성공 시 요청 객체에 유저 정보 저장 후 다음 처리로 이동
        req.user = user;
        next();
    });
};
