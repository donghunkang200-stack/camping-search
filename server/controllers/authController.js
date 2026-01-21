// server/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "xkvosaifjaojflwejflwejlj123j12l3j11l";

/**
 * 회원가입 처리
 * @param {Object} req - Express request 객체 (name, username, email, password 포함)
 * @param {Object} res - Express response 객체
 */
export const register = async (req, res) => {
    console.log("--- 회원가입 시도 ---");
    console.log("아이디:", req.body.username);
    try {
        const { name, username, email, password } = req.body;

        // 1. 필수 입력값 검증
        if (!username || !password) {
            return res.status(400).json({ message: "아이디와 비밀번호를 입력해주세요." });
        }

        // 2. 아이디 중복 확인 (MongoDB에서 조회)
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "이미 존재하는 아이디입니다." });
        }

        // 3. 비밀번호 보안을 위한 해싱 (가중치 10)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. 새 사용자 생성 및 DB 저장
        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword
        });
        await newUser.save();

        console.log(`✅ 새 유저 가입: ${username}`);
        res.status(201).json({ message: `${name}님 회원 가입성공!` });
    } catch (error) {
        console.error("회원가입 에러:", error);
        res.status(500).json({ message: "서버 오류로 가입에 실패했습니다." });
    }
};

/**
 * 로그인 처리 및 JWT 토큰 발급
 * @param {Object} req - Express request 객체 (username, password 포함)
 * @param {Object} res - Express response 객체
 */
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. 사용자 존재 여부 확인
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "아이디 또는 비밀번호가 틀렸습니다." });
        }

        // 2. 입력된 비밀번호와 해싱된 비밀번호 비교
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "아이디 또는 비밀번호가 틀렸습니다." });
        }

        // 3. 인증 성공 시 JWT 토큰 생성 (유효기간 1일)
        const token = jwt.sign({ username: user.username }, JWT_SECRET, {
            expiresIn: "1d",
        });

        console.log(`🔑 로그인 성공: ${username}`);
        res.json({ token });
    } catch (error) {
        console.error("로그인 에러:", error);
        res.status(500).json({ message: "서버 오류로 로그인에 실패했습니다." });
    }
};
