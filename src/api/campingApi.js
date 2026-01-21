// src/api/campingApi.js
import api from "./api";

/* ---------------------------------------------------
    1) 전체 캠핑장 목록 (캐싱된 데이터)
---------------------------------------------------- */
export const getAllCamping = () => {
  return api.get("/camping/all"); // { data: [...] } 형태 반환
};

/* ---------------------------------------------------
    2) 키워드 검색
---------------------------------------------------- */
export const searchCamping = (keyword) => {
  return api.get("/camping/search", {
    params: { keyword },
  });
};

// 특정 캠핑장 상세 정보 조회
export const getCampingDetail = (id) => {
  return api.get(`/camping/detail/${id}`);
};

/**
 * 주변 캠핑장 조회
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @param {number} distance - 검색 반경(km)
 */
export const getNearbyCamping = (lat, lng, distance = 10) => {
  return api.get("/camping/nearby", {
    params: { lat, lng, distance },
  });
};
