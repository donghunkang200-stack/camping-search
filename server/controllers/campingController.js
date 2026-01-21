// server/controllers/campingController.js
import axios from "axios";
import { cache, lastFetchTime, updateCache } from "../models/data.js";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = "https://apis.data.go.kr/B551011/GoCamping";
const CACHE_DURATION = 1000 * 60 * 30; // 30분

/**
 * 고캠핑 API로부터 전체 캠핑장 목록을 로드하는 내부 함수
 * 캐시가 유효하면 캐시된 데이터를 반환합니다.
 */
async function loadCampingData() {
    const now = Date.now();

    // 1. 캐시 유효 시간(30분) 확인 및 데이터 재사용
    if (cache.length > 0 && now - lastFetchTime < CACHE_DURATION) {
        return cache;
    }

    try {
        // 2. 외부 공공데이터 API 호출
        const response = await axios.get(`${BASE_URL}/basedList`, {
            params: {
                serviceKey: process.env.GOCAMPING_KEY,
                MobileOS: "ETC",
                MobileApp: "CampApp",
                numOfRows: 9999,
                pageNo: 1,
                _type: "json",
            },
        });

        // 3. 데이터 추출 및 캐시 업데이트
        const data = response.data.response?.body?.items?.item || [];
        updateCache(data);

        return data;
    } catch (err) {
        console.error("❌ 전체 데이터 로드 실패:", err);
        return [];
    }
}

/**
 * 전체 캠핑장 목록 조회 API 응답 처리
 */
export const getAllCamping = async (req, res) => {
    const data = await loadCampingData();
    res.json(data);
};

/**
 * 키워드 기반 캠핑장 검색 API
 */
export const searchCamping = async (req, res) => {
    try {
        const keyword = req.query.keyword;

        if (!keyword || keyword.trim() === "") {
            return res.json({ data: [] });
        }

        const response = await axios.get(`${BASE_URL}/searchList`, {
            params: {
                serviceKey: process.env.GOCAMPING_KEY,
                MobileOS: "ETC",
                MobileApp: "CampApp",
                keyword,
                numOfRows: 500,
                pageNo: 1,
                _type: "json",
            },
        });

        const result = response.data.response;
        const items = result?.body?.items?.item || [];

        res.json({ data: items });
    } catch (err) {
        console.error("SEARCH API ERROR:", err);
        res.status(500).json({ error: "검색 API 실패" });
    }
};

/**
 * 특정 캠핑장 상세 정보 조회 API
 */
export const getCampingDetail = async (req, res) => {
    const id = req.params.id;
    const all = await loadCampingData();
    const detail = all.find((camp) => String(camp.contentId) === id);
    res.json({ data: detail || null });
};

/**
 * 좌표를 기반으로 한 주변(반경) 캠핑장 조회 API
 */
export const getNearbyCamping = async (req, res) => {
    try {
        const { lat, lng, distance } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ message: "위도(lat), 경도(lng)가 필요합니다." });
        }

        const targetLat = Number(lat);
        const targetLng = Number(lng);
        const maxDistance = distance ? Number(distance) : 10;

        const all = await loadCampingData();

        const calcDistance = (lat1, lng1, lat2, lng2) => {
            const R = 6371;
            const dLat = ((lat2 - lat1) * Math.PI) / 180;
            const dLng = ((lng2 - lng1) * Math.PI) / 180;

            const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLng / 2) ** 2;

            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        const filtered = all.filter((camp) => {
            if (!camp.mapY || !camp.mapX) return false;
            const d = calcDistance(targetLat, targetLng, camp.mapY, camp.mapX);
            return d <= maxDistance;
        });

        filtered.sort((a, b) => {
            const da = calcDistance(targetLat, targetLng, a.mapY, a.mapX);
            const db = calcDistance(targetLat, targetLng, b.mapY, b.mapX);
            return da - db;
        });

        res.json({ data: filtered.slice(0, 5) });
    } catch (error) {
        console.error("NEARBY API ERROR:", error);
        res.status(500).json({ error: "주변 캠핑장 조회 실패" });
    }
};
