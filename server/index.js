import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const BASE_URL = "https://apis.data.go.kr/B551011/GoCamping";

/* ---------------------------------------------------
    1) 전체 캠핑장 목록 (basedList)
---------------------------------------------------- */
app.get("/api/camping/all", async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/basedList`, {
      params: {
        serviceKey: process.env.GOCAMPING_KEY,
        MobileOS: "ETC",
        MobileApp: "CampApp",
        numOfRows: 9999, // 전체 데이터 조회
        pageNo: 1,
        _type: "json",
      },
    });

    const result = response.data.response;

    if (!result?.body?.items) {
      return res.json({ data: [] });
    }

    const items = result.body.items.item || [];
    res.json({ data: items });
  } catch (err) {
    console.error("ALL API ERROR:", err);
    res.status(500).json({ error: "전체 목록 조회 실패" });
  }
});

/* ---------------------------------------------------
    2) 키워드 검색 (searchList)
---------------------------------------------------- */
app.get("/api/camping/search", async (req, res) => {
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

    if (!result?.body?.items) {
      return res.json({ data: [] });
    }

    const items = result.body.items.item || [];

    res.json({ data: items });
  } catch (err) {
    console.error("SEARCH API ERROR:", err);
    res.status(500).json({ error: "검색 API 실패" });
  }
});

// Express 백엔드 상세 API (전체 목록에서 contentId로 검색)
app.get("/api/camping/detail/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // 전체 데이터 요청
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

    const items = response.data.response?.body?.items?.item || [];

    // contentId에 매칭
    const detail = items.find((camp) => String(camp.contentId) === id);

    res.json({ data: detail || null });
  } catch (err) {
    console.error("DETAIL API ERROR:", err);
    res.status(500).json({ error: "상세정보 API 실패" });
  }
});

app.get("/api/camping/nearby", async (req, res) => {
  const { lat, lng, distance } = req.query;

  if (!lat || !lng) {
    return res
      .status(400)
      .json({ message: "위도(lat), 경도(lng)가 필요합니다." });
  }

  const targetLat = Number(lat);
  const targetLng = Number(lng);
  const maxDistance = distance ? Number(distance) : 10; // 기본 10km

  try {
    // GoCamping 전체 데이터
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

    const items = response.data.response?.body?.items?.item || [];

    // 거리 계산 함수
    const calcDistance = (lat1, lng1, lat2, lng2) => {
      const R = 6371; // 지구 반지름 km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c; // km 단위
    };

    // 거리 필터링
    const nearby = items.filter((camp) => {
      if (!camp.mapY || !camp.mapX) return false;

      const d = calcDistance(targetLat, targetLng, camp.mapY, camp.mapX);
      return d <= maxDistance;
    });

    // 가까운 순 정렬
    nearby.sort((a, b) => {
      const da = calcDistance(targetLat, targetLng, a.mapY, a.mapX);
      const db = calcDistance(targetLat, targetLng, b.mapY, b.mapX);
      return da - db;
    });

    res.json({ data: nearby.slice(0, 5) }); // 5개만 반환
  } catch (error) {
    console.error("NEARBY API ERROR:", error);
    res.status(500).json({ error: "주변 캠핑장 조회 실패" });
  }
});

/* ---------------------------------------------------
    서버 시작
---------------------------------------------------- */
app.listen(5000, () => console.log("Server running on port 5000"));
