# 🏕️ 캠핑가자 (Camping Search App)

**캠핑가자**는 공공데이터 포털의 **고캠핑(GoCamping) API**를 활용하여 전국의 캠핑장 정보를 한눈에 확인하고, 최적의 캠핑 장소를 찾을 수 있도록 돕는 프리미엄 캠핑 검색 플랫폼입니다.

---

## � 주요 기능 (Key Features)

### � 인증 및 보안 (Auth & Security)
- **JWT 기반 인증**: 로그인 및 회원가입 기능을 통해 나만의 캠핑 데이터를 안전하게 관리합니다.
- **접근 제어**: 로그인을 완료한 사용자만 캠핑장 검색 및 상세 정보를 확인할 수 있도록 보호된 라우트(Protected Routes)를 적용했습니다.

### 🔍 스마트 검색 및 필터링 (Search & Filtering)
- **실시간 디바운스 검색**: 타이핑과 동시에 결과를 보여주되, 서버 부하를 최소화하는 디바운스(Debounce) 기법을 적용했습니다.
- **지역별 상세 필터**: '시/도'와 '시/군/구'를 연동하여 원하는 지역의 캠핑장을 쉽고 빠르게 필터링할 수 있습니다.

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
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4 (Modern Design System)
- **Routing**: React Router 7
- **State Management**: Context API (Auth)
- **Icons & Toast**: React Toastify, Emoji-based Icons

### Backend
- **Runtime**: Node.js (Express)
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT (jsonwebtoken), Password Hashing (bcryptjs)
- **Proxy**: Vite Proxy Configuration (Backend Integration)

### External APIs
- **Camping Data**: 공공데이터포털 고캠핑 API
- **Maps**: Kakao Maps SDK & Places Service
- **Weather**: OpenWeatherMap API

---

## 📁 프로젝트 구조 (Folder Structure)

```text
camping-search/
├── src/
│   ├── api/            # Axios API 서비스 (인증 및 캠핑 데이터)
│   ├── components/     # 공통 레이아웃, 스켈레톤, 스크롤 컴포넌트
│   ├── contexts/       # AuthContext (로그인 상태 관리)
│   ├── pages/          # 홈, 로그인, 회원가입, 목록, 상세 페이지
│   └── index.css       # Tailwind v4 디자인 시스템 정의
├── server/
│   ├── controllers/    # 비즈니스 로직 (Auth, Camping)
│   ├── models/         # MongoDB 모델 (User) 및 캐시 데이터
│   ├── routes/         # API 경로 설정
│   └── index.js        # 서버 진입점 및 DB 연결
└── package.json        # 종속성 및 스크립트 설정
```

---

## ⚙️ 시작하기 (Get Started)

1. **저장소 복제**
   ```bash
   git clone [repository-url]
   ```

2. **의존성 설치**
   ```bash
   npm install        # 프론트엔드
   cd server
   npm install        # 백엔드
   ```

3. **환경 변수 설정 (`.env`)**
   - `VITE_KAKAO_JS_KEY`: 카카오맵 JavaScript 키
   - `VITE_WEATHER_API_KEY`: OpenWeather API 키
   - `GOCAMPING_KEY`: 고캠핑 서비스 키
   - `MONGODB_URI`: MongoDB 연결 문자열

4. **실행**
   ```bash
   # 백엔드 실행 (server 폴더에서)
   npm run dev
   
   # 프론트엔드 실행 (루트 폴더에서)
   npm run dev
   ```

---

**캠핑가자**와 함께 자연속으로 떠나는 즐거운 여정을 시작해보세요! 🏕️✨
