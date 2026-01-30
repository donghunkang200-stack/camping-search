import { Link, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { getCampingDetail, getNearbyCamping } from "../api/campingApi";
import { waitForKakao } from "../utils/kakao";
import "./CampingDetail.css";

export default function CampingDetail() {
  const { id } = useParams();
  const [camp, setCamp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nearby, setNearby] = useState([]);
  const [recommend, setRecommend] = useState([]);
  const [weather, setWeather] = useState(null);
  const [category, setCategory] = useState("FD6"); // 기본 맛집
  const [combinedList, setCombinedList] = useState([]);

  // 지도, 마커, 정보창 관리 Ref
  const mapRef = useRef(null);
  const markersRef = useRef([]); // 주변 장소 마커 저장
  const campMarkerRef = useRef(null);
  const infoWindowRef = useRef(null); // 현재 열린 InfoWindow
  const clickMarkerRef = useRef(null); // 클릭으로 생성된 단일 마커
  const previousClickedMarkerRef = useRef(null);

  const markerIcons = {
    campMain: "/campingsite.png",
    nearby: "/blue-location.png",
    recommend: "/blue-location.png",
    selected: "/yellow-location.png",
  };

  //마커 이미지 생성
  const createMarkerImage = (url) => {
    const kakao = window.kakao;
    if (!kakao || !kakao.maps) {
      console.error(
        "Kakao maps SDK not loaded yet - createMarkerImage called prematurely",
      );
      return null;
    }
    return new kakao.maps.MarkerImage(url, new kakao.maps.Size(40, 42), {
      offset: new kakao.maps.Point(20, 42),
    });
  };

  /**
   * 1. 캠핑장 상세 데이터 로드
   * useParams로 받은 ID를 사용하여 특정 캠핑장의 모든 정보를 가져옵니다.
   */
  const loadDetail = async () => {
    try {
      const data = await getCampingDetail(id);
      setCamp(data.data ?? null);
    } catch (err) {
      console.error("상세 조회 실패:", err);
      setCamp(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 2. 주변 캠핑장 추천 로드
   * 현재 캠핑장의 좌표(lat, lng)를 기준으로 반경 10km 내의 다른 캠핑장을 찾습니다.
   */
  const loadRecommendations = async (lat, lng) => {
    try {
      const data = await getNearbyCamping(lat, lng, 10);
      // 현재 보고 있는 캠핑장은 추천 목록에서 제외합니다.
      const filtered = (data.data || []).filter(
        (item) => item.contentId !== id,
      );
      setRecommend(filtered);
    } catch (err) {
      console.error("추천 캠핑장 로드 실패", err);
    }
  };

  /**
   * 3. 현재 위치 날씨 정보 로드
   * OpenWeatherMap API를 사용하여 현재 캠핑장의 기상 상태를 가져옵니다.
   */
  const loadWeather = async (lat, lng) => {
    try {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`,
      );
      const data = await res.json();
      setWeather(data);
    } catch (err) {
      console.error("날씨 불러오기 실패", err);
    }
  };

  /**
   * 4. 카카오 맵 주변 장소(카테고리) 검색
   * 맛집, 카페 등 선택된 카테고리에 해당하는 장소를 지도 라이브러리로 검색합니다.
   */
  const searchNearbyPlaces = (map) => {
    if (!window.kakao || !window.kakao.maps) {
      console.error("Kakao maps SDK not loaded - searchNearbyPlaces skipped");
      return;
    }
    const kakao = window.kakao;

    // 검색 전 기존에 열려있던 정보창과 마커들을 모두 정리합니다.
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null;
    }

    if (clickMarkerRef.current) {
      clickMarkerRef.current.setMap(null);
      clickMarkerRef.current = null;
    }

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const places = new kakao.maps.services.Places();
    const center = new kakao.maps.LatLng(camp.mapY, camp.mapX);

    // 반경 2km 내의 카테고리 장소를 검색합니다.
    places.categorySearch(
      category,
      (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
          setNearby(result);
          displayMarkers(map, result);
        }
      },
      { location: center, radius: 2000 },
    );
  };

  /**
   * 5. 검색된 장소들을 지도에 마커로 표시
   * 각 장소마다 클릭 이벤트(정보창 표시, 마커 색상 변경)를 등록합니다.
   */
  const displayMarkers = (map, places) => {
    const kakao = window.kakao;

    const newMarkers = places.map((place) => {
      // 추천 캠핑장인지 주변 시설인지에 따라 아이콘을 결정합니다.
      const icon =
        place.type === "recommend" ? markerIcons.recommend : markerIcons.nearby;

      const marker = new kakao.maps.Marker({
        map,
        position: new kakao.maps.LatLng(place.y, place.x),
        image: createMarkerImage(icon),
      });

      // 마커 클릭 시 나타날 정보창(InfoWindow) 설정
      const infoWindow = new kakao.maps.InfoWindow({
        content: `
        <div style="padding:10px; font-size:13px; width:220px;">
          <b>${place.place_name}</b><br/>
          <span style="font-size:12px; color:#555;">
            ${place.road_address_name || place.address_name}
          </span><br/>
          <a href="https://map.kakao.com/?itemId=${place.id}" target="_blank"
            style="font-size:12px; color:#1e90ff;">
            🔗 지도에서 보기
          </a>
        </div>
      `,
        removable: true,
      });

      // 마커 클릭 이벤트 핸들러
      kakao.maps.event.addListener(marker, "click", () => {
        // 이전에 강조되었던 마커를 일반 아이콘으로 되돌립니다.
        if (previousClickedMarkerRef.current) {
          previousClickedMarkerRef.current.setImage(
            createMarkerImage(markerIcons.nearby),
          );
        }

        // 현재 클릭한 마커를 노란색(선택됨)으로 변경하여 강조합니다.
        marker.setImage(createMarkerImage(markerIcons.selected));
        previousClickedMarkerRef.current = marker;

        if (infoWindowRef.current) infoWindowRef.current.close();
        infoWindow.open(map, marker);
        infoWindowRef.current = infoWindow;

        // 해당 장소로 지도의 중심을 부드럽게 이동시킵니다.
        map.panTo(new kakao.maps.LatLng(place.y, place.x));
      });

      return marker;
    });

    markersRef.current = newMarkers;
  };

  /**
   * 6. 편의 시설 아이콘 렌더링
   * 텍스트로 된 시설 정보를 아이콘과 함께 보기 좋게 변환합니다.
   */
  const renderFacilities = (text) => {
    if (!text) return <p>시설 정보 없음</p>;

    const icons = {
      화장실: "🚻",
      샤워실: "🚿",
      전기: "🔌",
      장작판매: "🔥",
      펫: "🐶",
      매점: "🧴",
      온수: "♨",
      무선인터넷: "📶",
      운동시설: "🏋️‍♀️",
      마트: "🍔",
    };

    return text.split(",").map((item, idx) => (
      <span key={idx} className="facility-tag">
        {icons[item.trim()] || "📌"} {item.trim()}
      </span>
    ));
  };

  /**
   * 7. 카카오톡 공유하기
   * 현재 캠핑장의 정보를 친구에게 메시지로 보냅니다.
   */
  const shareKakao = () => {
    if (!window.Kakao) return alert("카카오 SDK 로드 안됨");

    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY);
    }

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: camp.facltNm,
        description: camp.addr1,
        imageUrl: camp.firstImageUrl,
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href,
        },
      },
      buttons: [
        {
          title: "캠핑장 보기",
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
      ],
    });
  };

  /**
   * 8. 주변 목록 클릭 시 해당 위치로 지도 이동
   * 리스트에서 장소를 클릭하면 지도의 중심을 옮기고 안내창을 띄웁니다.
   */
  const handleMoveMap = (lat, lng, title, address, id) => {
    const kakao = window.kakao;

    if (!mapRef.current) {
      setTimeout(() => handleMoveMap(lat, lng, title, address, id), 200);
      return;
    }

    const map = mapRef.current;
    const moveLatLng = new kakao.maps.LatLng(lat, lng);

    map.setCenter(moveLatLng);

    if (clickMarkerRef.current) {
      clickMarkerRef.current.setMap(null);
      clickMarkerRef.current = null;
    }

    if (previousClickedMarkerRef.current) {
      previousClickedMarkerRef.current.setImage(
        createMarkerImage(markerIcons.nearby),
      );
      previousClickedMarkerRef.current = null;
    }

    const marker = new kakao.maps.Marker({
      map,
      position: moveLatLng,
      image: createMarkerImage(markerIcons.selected),
    });

    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null;
    }

    const infoWindow = new kakao.maps.InfoWindow({
      content: `<div style="padding:10px; font-size:13px; width:220px; word-break:break-all;">
      <b>${title}</b><br/>
        <span style="font-size:12px; color:#555;">${address}</span><br/>
        <a href="https://map.kakao.com/?itemId=${id}" target="_blank" style="font-size:12px; color:#1e90ff;">🔗 지도에서 보기</a>
      </div>`,
      removable: true,
    });

    infoWindow.open(map, marker);
    infoWindowRef.current = infoWindow;
    clickMarkerRef.current = marker;
  };

  /**
   * 9. ID 변경 시 데이터 새로고침 및 Cleanup
   */
  useEffect(() => {
    loadDetail();
    return () => {
      // 컴포넌트 언마운트 시 지도의 모든 자원(마커, 정보창)을 정리합니다.
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      if (campMarkerRef.current) campMarkerRef.current.setMap(null);
      if (infoWindowRef.current) infoWindowRef.current.close();
      mapRef.current = null;
    };
  }, [id]);

  /**
   * 10. 캠핑장 데이터 로드 후 지도 초기화
   */
  useEffect(() => {
    if (!camp || !camp.mapY || !camp.mapX) return;

    let canceled = false;

    waitForKakao(10000)
      .then((kakao) => {
        if (canceled) return;
        const container = document.getElementById("map");

        const options = {
          center: new kakao.maps.LatLng(camp.mapY, camp.mapX),
          level: 5,
        };

        const map = new kakao.maps.Map(container, options);
        mapRef.current = map;

        // 빈 지도 클릭 시 열려있는 마커 강조와 정보창을 닫습니다.
        kakao.maps.event.addListener(map, "click", () => {
          if (clickMarkerRef.current) {
            clickMarkerRef.current.setMap(null);
            clickMarkerRef.current = null;
          }
          if (previousClickedMarkerRef.current) {
            previousClickedMarkerRef.current.setImage(
              createMarkerImage(markerIcons.nearby),
            );
            previousClickedMarkerRef.current = null;
          }
          if (infoWindowRef.current) {
            infoWindowRef.current.close();
            infoWindowRef.current = null;
          }
        });

        addCampingMarker(map, camp.mapY, camp.mapX);
        searchNearbyPlaces(map);
        loadRecommendations(camp.mapY, camp.mapX);
        loadWeather(camp.mapY, camp.mapX);
      })
      .catch((err) => {
        console.error("Kakao SDK failed to load:", err);
      });

    return () => {
      canceled = true;
    };
  }, [camp]);

  /**
   * 11. 카테고리(맛집, 카페 등) 변경 시 주변 장소 재검색
   */
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // 기존 검색 상태 초기화
    setNearby([]);
    setCombinedList([]);
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    if (clickMarkerRef.current) {
      clickMarkerRef.current.setMap(null);
      clickMarkerRef.current = null;
    }
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null;
    }

    // 추천 캠핑장의 경우 별도의 카테고리 검색 없이 이전 데이터를 활용합니다.
    if (category === "RECOMMEND") {
      setNearby([]);
      displayMarkers(
        map,
        recommend
          .filter((c) => c.contentId !== camp.contentId)
          .map((c) => ({
            id: c.contentId,
            place_name: c.facltNm,
            address_name: c.addr1,
            x: c.mapX,
            y: c.mapY,
            type: "recommend",
          })),
      );
      return;
    }
    searchNearbyPlaces(mapRef.current);
  }, [category]);

  /**
   * 12. 메인 캠핑장 위치에 고정 마커 표시
   */
  const addCampingMarker = (map, lat, lng) => {
    const kakao = window.kakao;
    const marker = new kakao.maps.Marker({
      map,
      position: new kakao.maps.LatLng(lat, lng),
      image: createMarkerImage(markerIcons.campMain),
    });
    campMarkerRef.current = marker;
  };

  //추천 캠핑장 + 주변 시설 리스트 통합
  useEffect(() => {
    if (!nearby || !recommend) return;

    // 추천 캠핑장 정제
    const recommendFormatted = recommend.map((c) => ({
      id: c.contentId,
      place_name: c.facltNm,
      address_name: c.addr1,
      x: c.mapX,
      y: c.mapY,
      type: "recommend",
    }));

    // 주변 장소 정제
    const nearbyFormatted = nearby.map((n) => ({
      id: n.id,
      place_name: n.place_name,
      address_name: n.road_address_name || n.address_name,
      x: n.x,
      y: n.y,
      type: "nearby",
    }));

    // 통합 리스트
    setCombinedList([...nearbyFormatted, ...recommendFormatted]);
  }, [nearby, recommend]);

  if (loading) return <p>로딩중...</p>;
  if (!camp) return <p>데이터 없음</p>;

  return (
    <div className="camp-detail-container">
      {/* 상단 헤더 섹션 */}
      <header className="camp-detail-header">
        <Link to="/camping" className="back-link">
          <span className="icon">←</span> 돌아가기
        </Link>
        <h1 className="camp-main-title">{camp.facltNm}</h1>
        <div className="camp-sub-info">
          <span className="camp-tag">
            {camp.doNm} {camp.sigunguNm}
          </span>
          <p className="camp-full-addr">🏁 {camp.addr1}</p>
        </div>
      </header>

      {/* 메인 비주얼 이미지 */}
      <div className="camp-hero-image">
        {camp.firstImageUrl ? (
          <img src={camp.firstImageUrl} alt={camp.facltNm} />
        ) : (
          <div className="no-hero-image">
            🔥 멋진 캠핑 사진을 기다리고 있어요!
          </div>
        )}
      </div>

      <div className="camp-grid-layout">
        {/* 왼쪽: 상세 정보 섹션 */}
        <section className="camp-main-content">
          <div className="content-card">
            <h3 className="section-title">🌿 캠핑장 소개</h3>
            <p className="camp-description">
              {camp.intro ||
                "자연과 함께하는 힐링 캠핑장입니다. 조용하고 쾌적한 환경을 자랑합니다."}
            </p>
          </div>

          <div className="content-card">
            <h3 className="section-title">🚿 편의 시설</h3>
            <div className="facility-grid">{renderFacilities(camp.sbrsCl)}</div>
          </div>

          <div className="content-card">
            <h3 className="section-title">⛅ 현재 캠핑장 날씨</h3>
            {weather ? (
              <div className="weather-widget">
                <div className="weather-item">
                  <span className="w-label">온도</span>
                  <span className="w-value">{weather.main.temp}°C</span>
                </div>
                <div className="weather-item">
                  <span className="w-label">습도</span>
                  <span className="w-value">{weather.main.humidity}%</span>
                </div>
                <div className="weather-item">
                  <span className="w-label">바람</span>
                  <span className="w-value">{weather.wind.speed} m/s</span>
                </div>
              </div>
            ) : (
              <p className="loading-text">날씨 정보를 가져오는 중...</p>
            )}
          </div>
          <div className="content-card contact-section">
            <h3 className="section-title">📞 고객센터 및 연락처</h3>
            <div className="contact-box">
              <div className="contact-item">
                <span className="contact-label">대표번호</span>
                <span className="contact-value">
                  {camp.tel || "등록된 번호가 없습니다"}
                </span>
              </div>
              {camp.tel && (
                <a href={`tel:${camp.tel}`} className="call-now-btn">
                  바로 전화하기 📞
                </a>
              )}
            </div>
          </div>
          <div className="action-row">
            <button className="kakao-share-btn" onClick={shareKakao}>
              카카오톡 친구에게 공유하기 💬
            </button>
          </div>
        </section>

        {/* 오른쪽: 지도 및 주변 장소 섹션 */}
        <aside className="camp-side-content">
          <div className="sticky-side">
            <h3 className="section-title">📍 주변 탐색</h3>
            <div className="category-tabs">
              {[
                { id: "FD6", label: "맛집" },
                { id: "CE7", label: "카페" },
                { id: "AT4", label: "명소" },
                { id: "CS2", label: "편의점" },
                { id: "RECOMMEND", label: "주변 캠핑장" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={category === tab.id ? "tab-btn active" : "tab-btn"}
                  onClick={() => setCategory(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div id="map" className="detail-map"></div>

            <div className="nearby-scroll-area">
              <ul className="nearby-list-box">
                {combinedList
                  .filter((p) =>
                    category === "RECOMMEND"
                      ? p.type === "recommend"
                      : p.type !== "recommend",
                  )
                  .map((place) => (
                    <li
                      key={place.id}
                      className="nearby-card-item"
                      onClick={() =>
                        handleMoveMap(
                          place.y,
                          place.x,
                          place.place_name,
                          place.address_name,
                          place.id,
                        )
                      }
                    >
                      <div className="nearby-info">
                        <strong>{place.place_name}</strong>
                        <p>{place.address_name}</p>
                      </div>
                      <span className="move-arrow">→</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
