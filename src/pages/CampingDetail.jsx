import { Link, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
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
    campMain: "../../public/campingsite.png",
    nearby: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    recommend: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    selected: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  };

  //마커 이미지 생성
  const createMarkerImage = (url) => {
    const kakao = window.kakao;
    return new kakao.maps.MarkerImage(url, new kakao.maps.Size(40, 42), {
      offset: new kakao.maps.Point(20, 42),
    });
  };

  /** 🔹 캠핑장 상세 데이터 로드 */
  const loadDetail = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/camping/detail/${id}`);
      const data = await res.json();
      setCamp(data.data ?? null);
    } catch (err) {
      console.error("상세 조회 실패:", err);
      setCamp(null);
    } finally {
      setLoading(false);
    }
  };

  /** 주변 캠핑장 추천 */
  const loadRecommendations = async (lat, lng) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/camping/nearby?lat=${lat}&lng=${lng}&distance=10`
      );
      const data = await res.json();
      // ⭐ 현재 캠핑장은 제외하고 추천 목록 생성
      const filtered = (data.data || []).filter(
        (item) => item.contentId !== camp.contentId
      );
      setRecommend(filtered);
    } catch (err) {
      console.error("추천 캠핑장 로드 실패", err);
    }
  };

  /** 날씨 */
  const loadWeather = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=8ae0bcae9c8257ffa820f9449148fc80&units=metric`
      );
      const data = await res.json();
      setWeather(data);
    } catch (err) {
      console.error("날씨 불러오기 실패", err);
    }
  };

  /** 🔹 주변 장소 검색 */
  const searchNearbyPlaces = (map) => {
    const kakao = window.kakao;

    // 기존 정보창 닫기
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null;
    }

    // 기존 단일 클릭 마커 제거
    if (clickMarkerRef.current) {
      clickMarkerRef.current.setMap(null);
      clickMarkerRef.current = null;
    }

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const places = new kakao.maps.services.Places();
    const center = new kakao.maps.LatLng(camp.mapY, camp.mapX);

    places.categorySearch(
      category,
      (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
          setNearby(result);
          displayMarkers(map, result);
        }
      },
      { location: center, radius: 2000 }
    );
  };

  /** 🔹 주변 마커 표시 */
  const displayMarkers = (map, places) => {
    const kakao = window.kakao;

    const newMarkers = places.map((place) => {
      // 타입에 따라 아이콘 변경
      const icon =
        place.type === "recommend" ? markerIcons.recommend : markerIcons.nearby;

      const marker = new kakao.maps.Marker({
        map,
        position: new kakao.maps.LatLng(place.y, place.x),
        image: createMarkerImage(icon),
      });

      const infoWindow = new kakao.maps.InfoWindow({
        content: `
        <div style="padding:10px; font-size:13px; width:220px;">
          <b>${place.place_name}</b><br/>
          <span style="font-size:12px; color:#555;">
            ${place.road_address_name || place.address_name}
          </span><br/>
          <a href="https://map.kakao.com/link/map/${place.id}" target="_blank"
            style="font-size:12px; color:#1e90ff;">
            🔗 지도에서 보기
          </a>
        </div>
      `,
        removable: true,
      });

      kakao.maps.event.addListener(marker, "click", () => {
        // 🔹 기존 클릭 마커를 원래 아이콘으로 되돌리기
        if (previousClickedMarkerRef.current) {
          previousClickedMarkerRef.current.setImage(
            createMarkerImage(markerIcons.nearby)
          );
        }

        // 🔹 추천 캠핑장인지 확인해서 기본 아이콘 선택
        const baseIcon =
          place.type === "recommend"
            ? markerIcons.recommend
            : markerIcons.nearby;

        // 🔹 현재 마커를 노란색으로 변경
        marker.setImage(createMarkerImage(markerIcons.selected));

        // 🔹 이전 클릭 마커 업데이트
        previousClickedMarkerRef.current = marker;

        if (clickMarkerRef.current) {
          clickMarkerRef.current.setMap(null);
          clickMarkerRef.current = null;
        }
        if (infoWindowRef.current) infoWindowRef.current.close();

        infoWindow.open(map, marker);
        infoWindowRef.current = infoWindow;

        map.panTo(new kakao.maps.LatLng(place.y, place.x));
      });

      return marker;
    });

    markersRef.current = newMarkers;
  };

  /** 시설정보 */
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

  /** SNS 공유 */
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

  //리스트 클릭하면 지도 이동 + 마커 표시
  const handleMoveMap = (lat, lng, title, address, id) => {
    const kakao = window.kakao;

    if (!mapRef.current) {
      console.warn("지도 준비 안됨 — 잠시 후 다시 시도합니다.");
      // 안전하게 재시도 (짧게)
      setTimeout(() => handleMoveMap(lat, lng, title, address, id), 200);
      return;
    }

    const map = mapRef.current;
    const moveLatLng = new kakao.maps.LatLng(lat, lng);

    // 지도 이동
    map.setCenter(moveLatLng);

    // --- 클릭 마커(선택 마커)만 제거하고 교체 ---
    if (clickMarkerRef.current) {
      clickMarkerRef.current.setMap(null);
      clickMarkerRef.current = null;
    }

    // ⭐ 선택된 주변 장소 노란마커도 원상 복구
    if (previousClickedMarkerRef.current) {
      previousClickedMarkerRef.current.setImage(
        createMarkerImage(markerIcons.nearby)
      );
      previousClickedMarkerRef.current = null;
    }

    // 새 마커 생성 (클릭 마커)
    const marker = new kakao.maps.Marker({
      map,
      position: moveLatLng,
      image: createMarkerImage(markerIcons.selected),
    });

    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null;
    }

    // 인포윈도우
    const infoWindow = new kakao.maps.InfoWindow({
      content: `<div style="
      padding:10px;
      font-size:13px;
      width:220px;
      word-break:break-all;
      white-space:normal;
      overflow-wrap:break-word;
    ">
      <b>${title}</b><br/>
        <span style="font-size:12px; color:#555;">
          ${address}
        </span><br/>
        <a href="https://map.kakao.com/link/map/${id}" target="_blank"
            style="font-size:12px; color:#1e90ff;">
            🔗 지도에서 보기
          </a>
          </div>`,
      removable: true,
    });

    infoWindow.open(map, marker);
    infoWindowRef.current = infoWindow;
    clickMarkerRef.current = marker; // 클릭 마커 ref에 저장
  };

  /** 🔹 id 변경 시 기본 cleanup */
  useEffect(() => {
    loadDetail();
    return () => {
      // 주변 마커 제거
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      // 캠핑장 마커 제거
      if (campMarkerRef.current) {
        campMarkerRef.current.setMap(null);
        campMarkerRef.current = null;
      }

      // 정보창 제거
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }

      mapRef.current = null;
    };
  }, [id]);

  /** 🔹 지도 초기 생성 */
  useEffect(() => {
    if (!camp || !camp.mapY || !camp.mapX) return;

    const kakao = window.kakao;
    const container = document.getElementById("map");

    const options = {
      center: new kakao.maps.LatLng(camp.mapY, camp.mapX),
      level: 5,
    };

    const map = new kakao.maps.Map(container, options);
    mapRef.current = map;

    /** ⭐⭐ 지도 클릭 시 노란마커 제거 ⭐⭐ */
    kakao.maps.event.addListener(map, "click", () => {
      // 선택된 노란마커 제거
      if (clickMarkerRef.current) {
        clickMarkerRef.current.setMap(null);
        clickMarkerRef.current = null;
      }

      // ⭐ 선택된 주변 장소 노란마커도 원상 복구
      if (previousClickedMarkerRef.current) {
        previousClickedMarkerRef.current.setImage(
          createMarkerImage(markerIcons.nearby)
        );
        previousClickedMarkerRef.current = null;
      }

      // 열려 있는 인포윈도우 닫기
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }
    });

    addCampingMarker(map, camp.mapY, camp.mapX);
    searchNearbyPlaces(map);
    loadRecommendations(camp.mapY, camp.mapX);
    loadWeather(camp.mapY, camp.mapX);
  }, [camp]);

  /** 🔹 카테고리 변경 시 주변 장소 재검색 */
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // 🔥 리스트 초기화
    setNearby([]);
    setCombinedList([]);

    // 🔥 기존 주변 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // 🔥 기존 클릭 마커 제거
    if (clickMarkerRef.current) {
      clickMarkerRef.current.setMap(null);
      clickMarkerRef.current = null;
    }

    // 🔥 기존 인포윈도우 제거
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null;
    }

    // ⭐ 추천 캠핑장은 카카오 카테고리 검색하지 않음
    if (category === "RECOMMEND") {
      setNearby([]); // 주변 장소 비움
      displayMarkers(
        map,
        recommend
          .filter((c) => c.contentId !== camp.contentId) // ⭐ 현재 캠핑장 제외
          .map((c) => ({
            id: c.contentId,
            place_name: c.facltNm,
            address_name: c.addr1,
            x: c.mapX,
            y: c.mapY,
            type: "recommend",
          }))
      );
      return;
    }
    searchNearbyPlaces(mapRef.current);
  }, [category]);

  /** 🔹 캠핑장 마커 추가 */
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
    <div className="camp-wrapper">
      <h1 className="camp-title">🏕 {camp.facltNm}</h1>

      <div className="camp-info-row">
        <p className="camp-addr">🏁 {camp.addr1}</p>
        <Link to="/" className="back-button">
          ← 캠핑장 목록으로
        </Link>
      </div>

      {camp.firstImageUrl && (
        <img src={camp.firstImageUrl} className="camp-img" alt="캠핑장" />
      )}

      <h3 className="camp-section">📌 시설 안내</h3>
      <div className="facility-box">{renderFacilities(camp.sbrsCl)}</div>

      <h3 className="camp-section">⛅ 날씨</h3>
      {weather ? (
        <div className="weather-box">
          <p>🌡온도: {weather.main.temp}°C</p>
          <p>💦습도: {weather.main.humidity}%</p>
          <p>🌫바람: {weather.wind.speed} m/s</p>
        </div>
      ) : (
        <p>날씨 정보를 불러오는 중...</p>
      )}

      <h3 className="camp-section">📞 연락처</h3>
      <p>{camp.tel || "정보 없음"}</p>

      <h3 className="camp-section">📝 소개</h3>
      <p>{camp.intro || "소개 정보 없음"}</p>

      <div className="share-box">
        <button onClick={shareKakao}>카카오톡 공유하기</button>
      </div>

      <div className="category-buttons">
        <button
          className={category === "FD6" ? "selected" : ""}
          onClick={() => setCategory("FD6")}
        >
          맛집
        </button>
        <button
          className={category === "CE7" ? "selected" : ""}
          onClick={() => setCategory("CE7")}
        >
          카페
        </button>
        <button
          className={category === "AT4" ? "selected" : ""}
          onClick={() => setCategory("AT4")}
        >
          명소
        </button>
        <button
          className={category === "CS2" ? "selected" : ""}
          onClick={() => setCategory("CS2")}
        >
          편의점
        </button>
        <button
          className={category === "RECOMMEND" ? "selected" : ""}
          onClick={() => setCategory("RECOMMEND")}
        >
          주변 캠핑장
        </button>
      </div>

      <div id="map" className="camp-map"></div>

      <div className="nearby-list">
        <h2>📍 주변 장소</h2>
        {combinedList.length === 0 ? (
          <p>자료를 불러오는 중...</p>
        ) : (
          <ul>
            {combinedList
              .filter((place) => {
                // 주변 캠핑장은 RECOMMEND 카테고리일 때만 표시
                if (category !== "RECOMMEND" && place.type === "recommend") {
                  return false;
                }
                return true;
              })
              .map((place) => (
                <li
                  key={place.id}
                  className="nearby-item"
                  onClick={() =>
                    handleMoveMap(
                      place.y,
                      place.x,
                      place.place_name,
                      place.address_name,
                      place.id
                    )
                  }
                >
                  {place.place_name} - {place.address_name}
                </li>
              ))}

            {/* 🔥 필터 후에도 아무것도 없을 때 */}
            {combinedList.filter((p) =>
              category === "RECOMMEND"
                ? p.type === "recommend"
                : p.type !== "recommend"
            ).length === 0 && (
              <li style={{ color: "#666" }}>주변 장소가 없습니다.</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
