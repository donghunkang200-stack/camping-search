// server/routes/authRoutes.js
import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

// 1. 회원가입 경로 (POST /api/register)
router.post("/register", register);

// 2. 로그인 경로 (POST /api/login)
router.post("/login", login);

export default router;
