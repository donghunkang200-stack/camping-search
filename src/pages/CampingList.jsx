import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
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
      const res = await fetch("http://localhost:5000/api/camping/all");
      const data = await res.json();

      setAllCampings(data.data);
      setFilteredCampings(data.data);
      // 첫 페이지 표시
      setVisibleCampings(data.data.slice(0, itemsPerPage));
      setDoNmList([...new Set(data.data.map((c) => c.doNm).filter(Boolean))]);
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
      <h1 className="camping-title">🏕 캠핑가자</h1>
      <h2 className="camping-title2"> 어디로 가고 싶으신가요?</h2>

      <div className="search-box">
        <input
          className="search-input"
          placeholder="검색어 (이름/주소)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        {/* 필터 */}
        <div className="location-filter">
          {/* 시/도 선택 */}
          <select
            className="filter-select"
            value={selectedDo}
            onChange={(e) => setSelectedDo(e.target.value)}
          >
            <option value="">시 / 도 전체</option>
            {doNmList.map((doItem) => (
              <option key={doItem} value={doItem}>
                {doItem}
              </option>
            ))}
          </select>

          {/* 시군구 선택 */}
          <select
            className="filter-select"
            value={selectedSigungu}
            onChange={(e) => setSelectedSigungu(e.target.value)}
            disabled={!selectedDo}
          >
            <option value="">시군구 전체</option>
            {sigunguNmList.map((sig) => (
              <option key={sig} value={sig}>
                {sig}
              </option>
            ))}
          </select>
        </div>
        <button className="search-button" onClick={handleSearch}>
          검색
        </button>
      </div>

      {visibleCampings.length === 0 && (
        <p className="no-result">⚠ 검색 결과가 없습니다.</p>
      )}

      <div className="camping-grid">
        {visibleCampings.map((camp, index) => (
          <div key={camp.contentId || index} className="camp-card">
            {camp.firstImageUrl ? (
              <img src={camp.firstImageUrl} alt="캠핑 이미지" />
            ) : (
              <div className="no-image-box">No Image</div>
            )}

            <div className="camp-content">
              <Link to={`/detail/${camp.contentId}`} className="camp-name">
                <h3>{camp.facltNm}</h3>
              </Link>

              <p className="camp-addr1">{camp.addr1}</p>
              <p className="camp-tel">📞 {camp.tel || "정보 없음"}</p>

              {camp.mapX && camp.mapY && (
                <a
                  className="map-link"
                  href={`https://map.kakao.com/link/map/${camp.facltNm},${camp.mapY},${camp.mapX}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  지도 보기 →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 화면 하단 감지 영역 */}
      <div ref={loaderRef} style={{ height: "50px" }}></div>
    </div>
  );
}
