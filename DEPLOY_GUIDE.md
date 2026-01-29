# 프로젝트 분리 및 배포 가이드

이 프로젝트는 백엔드(`server`)와 프론트엔드(`client`)로 분리되었습니다. 이제 각각 독립적으로 배포하고 관리할 수 있습니다.

## 📂 구조 설명

- **client/**: React 프론트엔드 애플리케이션
- **server/**: Node.js/Express 백엔드 서버
- **package.json**: 루트에서 두 프로젝트를 관리하기 위한 스크립트 포함

## 🚀 로컬 실행 방법

### 1. 패키지 설치
모든 의존성을 한 번에 설치하려면 루트 디렉토리에서 다음 명령어를 실행하세요:
```bash
npm install # 루트 패키지 설치 (concurrently 등)
npm run install:all # 클라이언트와 서버 의존성 설치
```

### 2. 개발 서버 실행
루트에서 한 번에 실행:
```bash
npm run dev
```
또는 각각 실행:
- **서버**: `npm run dev:server` (포트 5000)
- **클라이언트**: `npm run dev:client` (포트 5173)

## 🌐 배포 설정

### 백엔드 (Server)
- `server/.env` 파일에 필요한 환경 변수(`MONGODB_URI`, `JWT_SECRET` 등)를 설정해야 합니다.
- 배포 서비스(Render, Fly.io, Heroku 등)에 `server` 폴더를 기준으로 배포하세요.
- Start Command: `npm start`

### 프론트엔드 (Client)
- `client/.env` 파일에서 `VITE_API_BASE`를 배포된 백엔드 주소로 변경해야 합니다.
  - 예: `VITE_API_BASE=https://your-backend-api.com`
- 배포 서비스(Vercel, Netlify 등)에 `client` 폴더를 기준으로 배포하세요.
- Build Command: `npm run build`
- Output Directory: `dist`

## ⚠️ 주의사항
- 로컬 개발 시에는 프론트엔드의 `vite.config.js`에 설정된 Proxy가 동작하여 `/api` 요청을 백엔드로 전달합니다.
- 배포 시에는 Proxy가 동작하지 않으므로, `VITE_API_BASE` 환경 변수를 올바르게 설정하는 것이 중요합니다.
