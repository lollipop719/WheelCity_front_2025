# 휠도시 (Wheel City)

![KakaoMap](https://img.shields.io/badge/Map-KakaoMap-blue)  
![Ubuntu](https://img.shields.io/badge/Ubuntu-22.04%20LTS-orange)  
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)  
![Proxmox](https://img.shields.io/badge/Proxmox-8.2.2-lightgrey)

---

## 📌 개요
**휠도시(Wheel City)** 는 휠체어 이용자 등 이동약자를 위한 **접근성 지도 서비스**입니다.  
카카오맵 API를 기반으로 장소 검색, 경사로 제보, 서비스 소개 및 문의 페이지 등을 제공합니다.

---

## ✨ 주요 기능
- **카카오맵 기반 지도 표시** (일반 지도 / 스카이뷰 지원)
- **장소 검색** (카카오 장소 검색 API 연동)
- **스마트 크롤링 시스템** 🆕
  - **기본 정보 크롤링** (영업시간, 전화번호)
    - ⏰ 검색 즉시 자동 실행 (검색된 모든 매장)
  - **블로그 리뷰 크롤링** (지연 로딩)
    - ⏰ 매장 선택 후 블로그 탭 클릭 시에만 실행 (선택한 매장 1개)
    - 블로그 제목, 내용, 링크, 썸네일 표시
    - `https://place.map.kakao.com/{매장ID}#blogreview` 에서 크롤링
- **접근성 관련 메뉴 페이지**
  - 📖 소개 (`about.html`)
  - 🧭 경사로 제보 (`report.html`)
  - 🗺️ 접근성 지도 (`map.html`)
  - 💬 도움말 및 문의 (`help.html`)
- **로그인 페이지** (`login.html`)
- 하단 푸터:  
  `© 2025 휠도시 · Map API 제공: KakaoMap`

---

## 🔄 크롤링 동작 흐름

### 1️⃣ 검색 시 (기본 정보 크롤링)
```
사용자 검색 → 카카오맵 API 호출 → 여러 매장 결과 반환
   ↓
각 매장에 대해 병렬로 크롤링 (영업시간, 전화번호 등)
   ↓
검색 결과 목록에 표시
```

### 2️⃣ 매장 선택 후 블로그 탭 클릭 (블로그 리뷰 크롤링)
```
매장 선택 → 상세 정보 표시 → 사용자가 블로그 탭 클릭
   ↓
선택한 매장의 블로그 리뷰만 크롤링 (지연 로딩)
   ↓
블로그 리뷰 목록 표시
```

**💡 왜 이렇게 구현했나요?**
- 기본 정보는 검색 결과 목록에 바로 표시되어야 하므로 즉시 크롤링
- 블로그 리뷰는 모든 사용자가 보는 것이 아니므로 필요할 때만 크롤링 (성능 최적화)

---

## 🗂️ 디렉토리 구조
```
test_server/
├─ server.js                    # Node.js + Express 정적 서버
├─ package.json                 # Node.js 의존성 관리
├─ crawl_api.js                 # 기본 정보 크롤링 (영업시간, 전화번호)
├─ crawl_blog_reviews.js        # 블로그 리뷰 크롤링 🆕
└─ public/                      # 정적 웹 리소스
   ├─ index.html                # 메인 페이지 (지도)
   ├─ about.html
   ├─ report.html
   ├─ map.html
   ├─ help.html
   ├─ login.html
   └─ js/                       # JavaScript 모듈
      ├─ map-init.js            # 지도 초기화
      ├─ search.js              # 검색 및 기본 크롤링
      ├─ display.js             # 결과 표시 및 블로그 크롤링
      ├─ markers.js             # 마커 관리
      └─ events.js              # 이벤트 핸들러
```


---

## ⚙️ 실제 서비스 실행 환경
- **가상화 플랫폼**: Proxmox **8.2.2**
- **운영체제**: Ubuntu **22.04 LTS**
- **런타임**: Node.js **18+**, npm

---

## 🚀 설치 및 실행 방법

### 1. Node.js / npm 설치 확인
```bash
node -v
npm -v
````

Node.js 18 이상 권장.

### 2. 프로젝트 다운로드 및 의존성 설치

```bash
# 추후 업데이트 예정

# npm 초기화 (이미 package.json 있으면 생략)
npm init -y

# Express 설치
npm install express
```

### 3. 서버 실행

```bash
node server.js
```

성공 시:

```
✅ Server is running on http://localhost:3000
```

브라우저에서 접속:

```
http://서버IP:3000
```

> Nginx Proxy Manager 등을 사용하면 `https://wheelcity.example.com` 같은 도메인으로 프록시 연결 가능.

---

## 🔑 Kakao 개발자센터 설정

1. [카카오 개발자센터](https://developers.kakao.com/) → 애플리케이션 생성
2. **JavaScript 키** 확인
3. **플랫폼 > Web** → 사이트 도메인 등록 (예: `https://wheelcity.example.com`)
4. `index.html`, `map.html` 등의 Kakao SDK 부분 수정:

   ```html
   <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_JAVASCRIPT_KEY&libraries=services&autoload=false"></script>
   ```

   → `YOUR_KAKAO_JAVASCRIPT_KEY`를 본인 키로 교체

---

## 🛠️ 운영 팁

* HTML 수정 → 서버 재시작 없이 즉시 반영
* 프로덕션 환경: [pm2](https://pm2.keymetrics.io/) 로 백그라운드 실행 권장

  ```bash
  npm install -g pm2
  pm2 start server.js --name wheelcity
  ```

---

## 🧪 크롤링 기능 테스트 방법

### 1. 기본 정보 크롤링 확인
1. 브라우저에서 서비스 접속
2. 검색창에 "스타벅스" 등 검색
3. 개발자 도구 콘솔 확인:
   ```
   🕐 기본 정보 크롤링 시작 (영업시간, 전화번호)...
   1. 스타벅스 유성구청점 - ID: 12345
   2. 스타벅스 대전청사점 - ID: 12346
   ✅ 기본 정보 크롤링 완료
   ```

### 2. 블로그 리뷰 크롤링 확인
1. 검색 결과에서 매장 하나 선택
2. 상세 정보 패널에서 **"블로그"** 탭 클릭
3. 개발자 도구 콘솔 확인:
   ```
   🔄 블로그 탭 선택됨 - 블로그 리뷰 크롤링 요청
   📝 블로그 리뷰 크롤링 시작 - Place ID: 12345
   ℹ️ 이 크롤링은 매장 선택 후 블로그 탭 클릭 시에만 실행됩니다.
   ✅ 블로그 리뷰 크롤링 완료 - 발견된 리뷰 수: 5
   ```

### 3. 디버그 모드 (선택사항)
스크린샷을 저장하여 크롤링 과정 디버깅:
```bash
DEBUG_SCREENSHOTS=true node server.js
```

---

## 📄 라이선스

* 지도 및 장소 데이터: **Kakao Map API**







