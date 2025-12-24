import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { getAllCamping } from "../api/campingApi";
import "./CampingList.css";

export default function CampingList() {
  const [allCampings, setAllCampings] = useState([]);
  const [filteredCampings, setFilteredCampings] = useState([]);
  const [visibleCampings, setVisibleCampings] = useState([]); // 화면에 표시할 데이터
  const [keyword, setKeyword] = useState("");
  const [doNmList, setDoNmList] = useState([]);
  const [sigunguNmList, setSigunguNmList] = useState([]);
  const [selectedDo, setSelectedDo] = useState("");
  const [selectedSigungu, setSelectedSigungu] = useState("");

  const itemsPerPage = 12;
  const loaderRef = useRef(null);

  //전체 목록 로딩
  const loadAllCampings = async () => {
    try {
      const data = await getAllCamping();

      setAllCampings(data);
      setFilteredCampings(data);
      // 첫 페이지 표시
      setVisibleCampings(data.slice(0, itemsPerPage));

      setDoNmList([...new Set(data.map((c) => c.doNm).filter(Boolean))]);
      console.log("캠핑 데이터:", data);
    } catch (error) {
      console.error("전체 목록 로딩 실패:", error);
    }
  };

  useEffect(() => {
    loadAllCampings();
  }, []);
  //검색기능
  const handleSearch = () => {
    applyFilters();
  };

  useEffect(() => {
    applyFilters();
  }, [selectedDo, selectedSigungu]);

  // 📌 IntersectionObserver로 아래 감지 → 다음 12개 추가
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 바닥이 보이면 다음 목록 추가
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
      { threshold: 1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [filteredCampings]);

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
  //필터설정
  const applyFilters = () => {
    let result = [...allCampings];

    // 이름/주소 검색
    const key = keyword.trim().toLowerCase();
    if (key) {
      result = result.filter(
        (c) =>
          c.facltNm?.toLowerCase().includes(key) ||
          c.addr1?.toLowerCase().includes(key)
      );
    }

    // 시/도 필터
    if (selectedDo) result = result.filter((c) => c.doNm === selectedDo);

    // 시군구 필터
    if (selectedSigungu)
      result = result.filter((c) => c.sigunguNm === selectedSigungu);

    setFilteredCampings(result);
    setVisibleCampings(result.slice(0, itemsPerPage));
  };

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
              placeholder="캠핑장 이름이나 주소를 입력하세요"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
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

            <button className="search-button" onClick={handleSearch}>
              검색하기
            </button>
          </div>
        </div>
      </div>

      {visibleCampings.length === 0 && (
        <div className="no-result-box">
          <p className="no-result">
            ⚠ 검색 결과가 없습니다. 다른 검색어를 입력해보세요.
          </p>
        </div>
      )}

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
              {/* 지역 태그 추가 */}
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

      <div ref={loaderRef} className="scroll-loader">
        {visibleCampings.length < filteredCampings.length && (
          <div className="loading-spinner">더 많은 캠핑장 불러오는 중...</div>
        )}
      </div>
    </div>
  );
}
