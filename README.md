# 🏕️ 캠핑가자 (Camping Search App)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Zustand](https://img.shields.io/badge/zustand-%2320232a.svg?style=for-the-badge&logo=react&logoColor=white)

**캠핑가자**는 공공데이터 포털의 **고캠핑(GoCamping) API**를 활용하여 전국의 캠핑장 정보를 한눈에 확인하고, 최적의 캠핑 장소를 찾을 수 있도록 돕는 프리미엄 캠핑 검색 플랫폼입니다.

---

## ✨ 주요 기능 (Key Features)

### 🔐 인증 및 보안 (Auth & Security)

- **JWT 기반 인증**: 로그인 및 회원가입 기능을 통해 나만의 캠핑 데이터를 안전하게 관리합니다.
- **접근 제어**: 로그인을 완료한 사용자만 캠핑장 검색 및 상세 정보를 확인할 수 있도록 보호된 라우트(Protected Routes)를 적용했습니다.

### 🔍 스마트 검색 및 필터링 (Search & Filtering)

- **실시간 디바운스 검색**: 타이핑과 동시에 결과를 보여주되, 서버 부하를 최소화하는 디바운스(Debounce) 기법을 적용했습니다.
- **지역별 상세 필터**: '시/도'와 '시/군/구'를 연동하여 원하는 지역의 캠핑장을 쉽고 빠르게 필터링할 수 있습니다.
- **내 주변 캠핑장 찾기**: 사용자의 현재 위치(위도/경도)를 기반으로 가까운 캠핑장을 계산하여 추천해줍니다. (Haversine 공식 활용)

### ⛺ 캠핑장 탐색 (Exploration)

- **무한 스크롤 (Infinite Scroll)**: Intersection Observer를 활용하여 끊김 없는 사용자 경험을 제공합니다.
- **스켈레톤 UI (Skeleton UI)**: 데이터 로딩 시 테마 색상이 반영된 애니메이션을 통해 시각적 즐거움을 제공합니다.
- **프리미엄 카드 디자인**: Tailwind v4를 활용한 세련된 카드 UI로 캠핑장 정보를 직관적으로 전달합니다.

### 📄 상세 정보 및 편의 기능 (Detail & Utility)

- **실시간 날씨**: **OpenWeather API**를 연동하여 해당 캠핑장의 현재 온도, 습도, 풍속 정보를 실시간으로 제공합니다.
- **카카오 지도 연동**: 캠핑장의 정확한 위치를 지도에서 확인하고, 주변 맛집, 카페, 편의점 등을 카테고리별로 탐색할 수 있습니다.
- **카카오톡 공유**: 내가 찾은 멋진 캠핑장을 클릭 한 번으로 친구에게 공유할 수 있습니다.
- **자동 상단 이동**: 페이지 이동 시 항상 상단으로 스크롤을 고정하여 편의성을 높였습니다.

---

## 🛠️ 기술 스택 (Tech Stack)

### Frontend

| Category             | Technology                             |
| -------------------- | -------------------------------------- |
| **Framework**        | React 19 (Vite)                        |
| **Styling**          | Tailwind CSS v4 (Modern Design System) |
| **State Management** | **Zustand** (Global Store & Persist)   |
| **Routing**          | React Router 7                         |
| **Icons & UI**       | React Toastify, Emoji-based Icons      |

### Backend

| Category         | Technology                                      |
| ---------------- | ----------------------------------------------- |
| **Runtime**      | Node.js (Express)                               |
| **Database**     | MongoDB (Mongoose)                              |
| **Auth**         | JWT (jsonwebtoken), Password Hashing (bcryptjs) |
| **Optimization** | **In-Memory Caching** (API 요청 최적화)         |
| **Integration**  | Vite Proxy Configuration                        |

### External APIs

- **Camping Data**: 공공데이터포털 고캠핑 API
- **Maps**: Kakao Maps SDK & Places Service
- **Weather**: OpenWeatherMap API

---

## � 백엔드 캐시 및 데이터 갱신 (Backend Caching & Refresh)

- 서버 시작 시 외부 고캠핑 API로부터 전체 목록을 **선로딩(preload)** 하여, 첫 요청 시에도 빠른 응답을 보장합니다.
- 기본적으로 **30분**(`CACHE_DURATION = 1000 * 60 * 30`)마다 캐시를 자동 갱신합니다. 갱신 주기는 환경변수로 오버라이드 가능합니다:

```bash
# 밀리초 단위 (예: 30분 = 1800000)
CACHE_REFRESH_MS=1800000
```

- 서버는 외부 API 호출 시 **타임아웃 20초**(`axios` timeout) 설정을 적용하여 장시간 대기를 방지합니다. 관련 로그:
  - 서버 시작 후: `✅ 캠핑 데이터 캐시 선로딩 완료`
  - 주기 갱신 성공: `🔄 캠핑 데이터 캐시 갱신 완료`

> 개발 팁: 클라이언트의 기본 Axios 타임아웃(30초)으로 인해 외부 API 응답이 느릴 경우 클라이언트에서 `timeout of 30000ms exceeded` 에러가 발생할 수 있습니다. 필요 시 `client/src/api/api.js`의 `timeout` 값을 늘리거나 서버 캐시가 정상 동작하는지 확인하세요.

---

## �📁 프로젝트 구조 (Folder Structure)

```text
camping-search/
├── client/             # 프론트엔드 (React + Vite)
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── index.css
│   └── package.json
├── server/             # 백엔드 (Node.js + Express)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── index.js
└── package.json        # 통합 관리 스크립트
```

---

## ⚙️ 시작하기 (Get Started)

1. **저장소 복제**

   ```bash
   git clone [repository-url]
   ```

2. **의존성 설치**
   루트 디렉토리에서 모두 설치:

   ```bash
   npm install
   npm run install:all
   ```

3. **환경 변수 설정 (`.env`)**
   - `client/.env`: 프론트엔드 설정 (API 키 등)
   - `server/.env`: 백엔드 설정 (DB URI 등)

4. **실행**

   ```bash
   # 동시에 실행 (루트에서)
   npm run dev

   # 또는 각각 실행
   npm run dev:server
   npm run dev:client
   ```

---

## 🎯 포트폴리오 페이지 (Portfolio Page)

- **로컬 미리보기**: 개발 서버 실행 후 http://localhost:5173/portfolio.html 에서 확인할 수 있습니다.
- **포함 내용**: 한 줄 소개, 핵심 기능 요약, 핵심 파일 링크, 실행 방법 및 커스터마이즈 가이드(스크린샷/GIF 교체).
- **위치**: `client/public/portfolio.html` 및 `client/public/portfolio.css` (정적 페이지로 배포 가능).

> 팁: 배포 환경에 따라 정적 파일을 호스팅하면 경로가 바뀔 수 있으므로 배포 전에 경로를 한 번 확인하세요.

---

**캠핑가자**와 함께 자연속으로 떠나는 즐거운 여정을 시작해보세요! 🏕️✨
