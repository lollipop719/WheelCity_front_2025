# 서버 시작 전 호환성 점검(API키 등 수정해야할 부분 정리)

## 1. server.js
Line 4, 5, 6
KAKAO_REST_KEY, KAKAO_JS_KEY, KAKAO_REDIRECT_URI 점검 및 필요시 수정하기

## 2. index.html
Line 458
<script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=01785b9a288ab46417b78a3790ac85c5&libraries=services"></script> 점검 및 필요시 수정하기

## 3. auth.js
Line 4, 5
KAKAO_JS_KEY, KAKAO_REDIRECT_URI 점검 및 필요시 수정하기

로컬에서 실행 시 KAKAO_REDIRECT_URI를 https://localhost:3000/auth/kakao/callback

---

## 🕷️ 크롤링 기능 (선택 사항)

검색 결과에 영업시간 정보를 자동으로 크롤링하여 표시하는 기능을 추가했습니다.

### 빠른 설정

```bash
# Puppeteer 설치
npm install puppeteer

# 서버 실행
node server.js
```

서버 시작 시 다음 메시지가 표시되면 성공:
```
✅ 크롤링 API 로드됨 (puppeteer 사용 가능)
```

### 작동 방식

1. 장소 검색 → 카카오맵 API로 기본 정보 가져오기
2. 자동으로 각 장소의 상세 정보 크롤링
3. 영업시간, 전화번호, 주소 등을 검색 결과에 표시

### 자세한 정보

- **통합 크롤링 설정**: `SETUP_CRAWLING.md` 참조
- **단독 크롤러 실행**: `README_CRAWLER.md` 참조

### 크롤링 비활성화

크롤링 기능을 사용하지 않으려면 Puppeteer를 설치하지 마세요.  
서버가 자동으로 크롤링 없이 작동합니다.

---

## 📁 파일 구조

```
test_server/
├── server.js              # 메인 서버
├── crawl_api.js          # 크롤링 API 모듈 (선택)
├── crawl_business_hours.js # 단독 크롤러 (선택)
├── public/
│   ├── index.html
│   ├── auth.js
│   ├── auth.css
│   └── js/
│       ├── map-init.js    # 지도 초기화
│       ├── search.js      # 검색 + 크롤링 연동
│       ├── display.js     # 결과 표시
│       ├── markers.js     # 마커 관리
│       └── events.js      # 이벤트 처리
├── README.md             # 이 파일
├── SETUP_CRAWLING.md     # 크롤링 설정 가이드
└── README_CRAWLER.md     # 단독 크롤러 가이드
```