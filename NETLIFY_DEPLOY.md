# Netlify 프론트엔드 배포 가이드

프론트엔드(`client`)를 Netlify에 배포하는 방법입니다.

## 1단계: 변경사항(Redirects 파일) GitHub 올리기

방금 Netlify에서 새로고침 시 404 에러를 방지하기 위한 `_redirects` 파일을 추가했습니다. 이를 먼저 GitHub에 올려주세요.

```bash
git add .
git commit -m "Add _redirects for Netlify SPA routing"
git push origin main
```

## 2단계: Netlify 사이트 생성

1. [Netlify 대시보드](https://app.netlify.com/)에 로그인합니다.
2. **Add new site** > **Import from an existing project**를 클릭합니다.
3. 배포 위치로 **GitHub**를 선택하고 인증합니다.
4. `camping-search` 리포지토리를 선택합니다.

## 3단계: 빌드 설정 (Build Settings) - 중요!

배포 설정 화면에서 다음 내용을 정확하게 입력해야 합니다. 루트가 아닌 `client` 폴더를 배포해야 하므로 주의가 필요합니다.

*   **Base directory**: `client`
    *   (이 설정이 가장 중요합니다. 프로젝트의 프론트엔드 코드가 있는 폴더입니다.)
*   **Build command**: `npm run build`
    *   (Vite 빌드 명령어)
*   **Publish directory**: `dist`
    *   (Vite가 빌드 결과물을 생성하는 폴더이므로 `build`가 아닌 `dist`여야 합니다.)

## 4단계: 환경 변수 설정 (Environment Variables)

**Add environment variables** 버튼을 눌러 다음 키와 값을 추가합니다. 로컬 `client/.env` 파일 내용을 참고하세요.

1.  `VITE_API_BASE`: **(중요)** 아까 배포한 Koyeb 백엔드 주소
    *   예: `https://camping-search-user.koyeb.app` (뒤에 `/api`는 빼고 입력하세요. 코드가 알아서 붙입니다.)
2.  `VITE_KAKAO_JS_KEY`: (카카오 자바스크립트 키)
3.  `VITE_WEATHER_API_KEY`: (날씨 API 키)

## 5단계: 배포 시작

1. **Deploy site** 버튼을 클릭합니다.
2. `Site deploy in progress` 메시지가 뜨며 배포가 시작됩니다.
3. 잠시 후 `Production: Published` 상태가 되면 URL을 클릭하여 접속해 봅니다.

## ✅ 점검 사항

*   웹사이트에 접속하여 로그인/회원가입이 정상적으로 되는지 확인하세요.
*   백엔드와의 통신이 원활하다면 배포 성공입니다! 🎉
