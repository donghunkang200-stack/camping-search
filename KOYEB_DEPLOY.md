# Koyeb 백엔드 배포 가이드

Koyeb은 GitHub 리포지토리와 연동하여 백엔드 서버를 무료로 쉽게 배포할 수 있는 클라우드 플랫폼입니다.

## 1단계: GitHub에 코드 올리기

배포하기 전에 현재 변경된 폴더 구조(`client`, `server` 분리)를 GitHub에 반영해야 합니다. 터미널에서 다음 명령어를 실행해주세요:

```bash
git add .
git commit -m "Refactor: Separate client and server for deployment"
git push origin main
```

## 2단계: Koyeb 서비스 생성

1. [Koyeb 대시보드](https://app.koyeb.com/)에 로그인합니다.
2. **Create App** 버튼을 클릭합니다.
3. 배포 방식에서 **GitHub**를 선택합니다.
4. `camping-search` 리포지토리를 선택합니다.

## 3단계: 배포 설정 (중요!)

서비스 설정 화면에서 다음 항목들을 정확하게 입력해야 합니다.

*   **Builder**: `Node.js` 선택
*   **Root Directory**: `server`
    *   ⚠️ **가장 중요합니다!** 기본값 `/` 대신 반드시 `server`라고 입력해야 백엔드 폴더만 인식합니다.
*   **Build Command**: `npm install`
    *   (기본값이 `npm start`나 `npm run build`인 경우 `npm install`로 변경해주세요)
*   **Run Command**: `npm start`
*   **Instance Type**: `Free` (Eco) 또는 `Micro` 선택

## 4단계: 환경 변수 설정 (Environment Variables)

백엔드 실행에 필요한 환경 변수를 Koyeb에 등록해야 합니다. `.env` 파일의 내용을 참고하세요.

1. **Add Variable** 버튼을 눌러 하나씩 추가합니다.
   *   `MONGODB_URI`: (MongoDB Atlas 접속 주소)
   *   `JWT_SECRET`: (사용할 비밀키)
   *   `GOCAMPING_KEY`: (고캠핑 API 인증키)
2. `PORT`는 Koyeb이 자동으로 주입하므로 따로 설정하지 않아도 됩니다. (코드에서 `process.env.PORT`를 사용하고 있음)

## 5단계: 배포 시작

1. 하단의 **Deploy** 버튼을 클릭합니다.
2. 배포 로그를 확인하며 "Healthy" 상태가 될 때까지 기다립니다.
3. 배포가 완료되면 `https://<app-name>.koyeb.app` 형식의 도메인이 생성됩니다.

## 6단계: 프론트엔드 연결

백엔드 배포가 완료되면 생성된 도메인 주소를 복사합니다.

1. 로컬 프로젝트의 `client/.env` 파일을 엽니다.
2. `VITE_API_BASE` 값을 방금 생성된 Koyeb 도메인으로 변경합니다.
   ```env
   VITE_API_BASE=https://your-app-name.koyeb.app
   ```
3. 이제 프론트엔드를 배포(Vercel/Netlify)하면 됩니다.

## 7단계: 배포 실패 시 해결 및 삭제 방법

### 로그 확인하기
배포가 실패했다면 삭제하기 전에 **Logs** 탭에서 원인을 확인해보세요.
- **Build Logs**: 패키지 설치(`npm install`)나 빌드 과정 문제
- **Runtime Logs**: 서버 실행 중 에러 (DB 연결 실패, 환경변수 누락 등)

### 서비스/앱 삭제하기
설정을 잘못하여 삭제 후 다시 만들고 싶다면:

1. **Service 삭제**: 
   - 대시보드에서 해당 **Service** 클릭
   - 상단 **Settings** 탭 클릭
   - 최하단 **Danger Zone** 영역의 **Delete Service** 버튼 클릭

2. **App 삭제** (프로젝트 전체 삭제):
   - 대시보드에서 **App** 선택 (예: `camping-search`)
   - **Settings** 탭 클릭
   - 최하단 **Danger Zone** 영역의 **Delete App** 버튼 클릭
