# 휠도시 프런트엔드

카카오맵을 기반으로 한 휠체어 접근성 정보 제공 서비스 휠도시의 프런트엔드입니다.  

![Ubuntu](https://img.shields.io/badge/Ubuntu-24.04%20LTS-E95420?logo=ubuntu&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-5FA04E?logo=node.js&logoColor=white)

## 구성
- `test_server/` : Express 정적 서버 및 프런트 리소스
  - `server.js` : 정적 파일 서빙 및 데모용 로그인/리뷰 API
  - `public/`   : HTML/CSS/JS, 이미지, 아이콘
  - `package.json` : 의존성 정의 (`express`, `cookie-session`, `axios`, `bcryptjs`, `puppeteer` 등)

## 빠른 시작 (Ubuntu 24.04 LTS, Node.js 18+)
```bash
cd test_server

# 의존성 설치
npm install

# 개발 서버 실행 (기본 3000 포트)
npm start
# 또는
node server.js
```

브라우저에서 `http://localhost:3000` 접속 후 확인합니다.  
백엔드(FastAPI, 포트 8000)가 동작 중이면, `public/js/api.js`의 `API_BASE_URL`과 `API_KEY`를 백엔드 설정에 맞춰 변경하세요.

## 환경 변수 (선택)
- `PORT` : 프런트 서버 포트 (기본 3000)
- `KAKAO_REDIRECT_URI`, `SESSION_SECRET` 등은 `server.js` 참고

## 배포 팁
- 프록시(Nginx 등)로 `http://localhost:3000`을 원하는 도메인에 매핑
- 백그라운드 실행: `pm2 start server.js --name wheelcity-front`

## 기타
- 홈 화면(사파리) 아이콘: `public/apple-touch-icon.png`
- 파비콘: `public/wheelcity.png`
