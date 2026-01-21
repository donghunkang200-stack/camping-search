// [통합] 데이터 모델 (캐시 및 전역 상태 관리)

// 캠핑 데이터 캐싱을 위한 변수들
export let cache = [];        // 전체 캠핑장 원본 데이터
export let lastFetchTime = 0; // 데이터를 마지막으로 불러온 시각

/**
 * 새로운 데이터를 받아 캐시와 시각을 업데이트하는 함수
 */
export const updateCache = (newData) => {
    cache = newData;
    lastFetchTime = Date.now();
};
