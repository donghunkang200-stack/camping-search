import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAllCamping } from "../api/campingApi";
import debounce from "lodash.debounce";
import SkeletonCard from "../components/SkeletonCard";
import "./CampingList.css";

export default function CampingList() {
  const [allCampings, setAllCampings] = useState([]);
  const [filteredCampings, setFilteredCampings] = useState([]);
  const [visibleCampings, setVisibleCampings] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [doNmList, setDoNmList] = useState([]);
  const [sigunguNmList, setSigunguNmList] = useState([]);
  const [selectedDo, setSelectedDo] = useState("");
  const [selectedSigungu, setSelectedSigungu] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const itemsPerPage = 12;
  const loaderRef = useRef(null);

  /**
   * 1. 전체 캠핑장 데이터 로드 (백엔드 API 호출)
   * 페이지 진입 시 한 번 실행되며, 전체 데이터를 가져와 상태를 초기화합니다.
   */
  const loadAllCampings = async () => {
    setIsLoading(true);
    try {
      const res = await getAllCamping();
      const data = res.data; // 서버에서 { data: [...] } 형태로 보내므로 배열만 추출

      if (Array.isArray(data)) {
        setAllCampings(data);
        setFilteredCampings(data);
        setVisibleCampings(data.slice(0, itemsPerPage));
        setDoNmList([...new Set(data.map((c) => c.doNm).filter(Boolean))]);
      } else {
        console.error("캠핑 데이터가 배열 형식이 아닙니다:", data);
      }
    } catch (error) {
      console.error("전체 목록 로딩 실패:", error);
    } finally {
      // 스켈레톤 UI 노출을 위해 의도적으로 약간의 지연 시간을 둡니다.
      setTimeout(() => setIsLoading(false), 600);
    }
  };

  useEffect(() => {
    loadAllCampings();
  }, []);

  /**
   * 2. 디바운스된 필터 적용 함수
   * 사용자가 입력을 멈춘 후(400ms)에만 필터링 로직을 수행하여 성능을 최적화합니다.
   */
  const debouncedApplyFilters = useCallback(
    debounce((currentKeyword, currentDo, currentSigungu) => {
      let result = [...allCampings];

      // 검색어 기반 필터링 (이름 또는 주소)
      const key = currentKeyword.trim().toLowerCase();
      if (key) {
        result = result.filter(
          (c) =>
            c.facltNm?.toLowerCase().includes(key) ||
            c.addr1?.toLowerCase().includes(key)
        );
      }

      // 지역(도) 필터링
      if (currentDo) result = result.filter((c) => c.doNm === currentDo);
      // 시군구 필터링
      if (currentDo && currentSigungu)
        result = result.filter((c) => c.sigunguNm === currentSigungu);

      setFilteredCampings(result);
      setVisibleCampings(result.slice(0, itemsPerPage));
    }, 400),
    [allCampings]
  );

  // 키워드나 지역 선택이 바뀔 때마다 필터링 트리거
  useEffect(() => {
    debouncedApplyFilters(keyword, selectedDo, selectedSigungu);
  }, [keyword, selectedDo, selectedSigungu, debouncedApplyFilters]);

  /**
   * 3. 검색 버튼 또는 엔터 키 입력 시 즉시 실행
   * 디바운스 대기 시간을 무시하고 즉시 결과를 반영합니다.
   */
  const handleSearch = () => {
    debouncedApplyFilters.flush();
  };

  /**
   * 4. 무한 스크롤 구현 (Intersection Observer)
   * 화면 하단의 감시 영역이 보이면 다음 데이터를 추가로 렌더링합니다.
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCampings((prev) => {
            const next = filteredCampings.slice(
              prev.length,
              prev.length + itemsPerPage
            );
            return [...prev, ...next];
          });
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [filteredCampings]);

  /**
   * 5. 지역(도) 선택 시 하위 시군구 목록 동적 업데이트
   */
  useEffect(() => {
    if (!selectedDo) {
      setSigunguNmList([]);
      setSelectedSigungu("");
      return;
    }

    const filtered = allCampings
      .filter((c) => c.doNm === selectedDo)
      .map((c) => c.sigunguNm);

    setSigunguNmList([...new Set(filtered.filter(Boolean))]);
    setSelectedSigungu("");
  }, [selectedDo, allCampings]);

  return (
    <div className="camping-container">
      <header className="list-header">
        <span className="emoji-badge">🏕️🚗</span>
        <h1 className="camping-title">캠핑장 찾기</h1>
        <p className="camping-subtitle">
          지친 일상을 떠나 자연 속으로 들어가는 첫 걸음
        </p>
      </header>

      <div className="search-section">
        <div className="search-box">
          <div className="input-group">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="캠핑장 이름이나 주소를 입력하세요 (실시간 검색)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          <div className="location-filter">
            <select
              className="filter-select"
              value={selectedDo}
              onChange={(e) => setSelectedDo(e.target.value)}
            >
              <option value="">시 / 도 선택</option>
              {doNmList.map((doItem) => (
                <option key={doItem} value={doItem}>
                  {doItem}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedSigungu}
              onChange={(e) => setSelectedSigungu(e.target.value)}
              disabled={!selectedDo}
            >
              <option value="">시군구 선택</option>
              {sigunguNmList.map((sig) => (
                <option key={sig} value={sig}>
                  {sig}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="camping-grid">
          {[...Array(itemsPerPage)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          {visibleCampings.length === 0 ? (
            <div className="no-result-box">
              <p className="no-result">
                ⚠ 검색 결과가 없습니다. 다른 검색어를 입력해보세요.
              </p>
            </div>
          ) : (
            <div className="camping-grid">
              {visibleCampings.map((camp, index) => (
                <div key={camp.contentId || index} className="camp-card">
                  <div className="camp-image-wrapper">
                    {camp.firstImageUrl ? (
                      <img
                        src={camp.firstImageUrl}
                        alt={camp.facltNm}
                        loading="lazy"
                      />
                    ) : (
                      <div className="no-image-box">🔥 No Image</div>
                    )}
                    <span className="do-tag">{camp.doNm}</span>
                  </div>

                  <div className="camp-content">
                    <Link to={`/detail/${camp.contentId}`} className="camp-name">
                      <h3>{camp.facltNm}</h3>
                    </Link>

                    <div className="camp-info">
                      <p className="camp-addr1">
                        <span className="icon">📍</span> {camp.addr1}
                      </p>
                      <p className="camp-tel">
                        <span className="icon">📞</span> {camp.tel || "정보 없음"}
                      </p>
                    </div>

                    <div className="card-footer">
                      {camp.mapX && camp.mapY && (
                        <a
                          className="map-link-btn"
                          href={`https://map.kakao.com/link/map/${camp.facltNm},${camp.mapY},${camp.mapX}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          길찾기 →
                        </a>
                      )}
                      <Link
                        to={`/detail/${camp.contentId}`}
                        className="detail-link-btn"
                      >
                        상세보기
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div ref={loaderRef} className="scroll-loader">
        {!isLoading && visibleCampings.length < filteredCampings.length && (
          <div className="loading-spinner">더 많은 캠핑장 불러오는 중...</div>
        )}
      </div>
    </div>
  );
}
