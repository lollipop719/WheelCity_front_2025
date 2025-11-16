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
- **접근성 관련 메뉴 페이지**
  - 📖 소개 (`about.html`)
  - 🧭 경사로 제보 (`report.html`)
  - 🗺️ 접근성 지도 (`map.html`)
  - 💬 도움말 및 문의 (`help.html`)
- **로그인 페이지** (`login.html`)
- 하단 푸터:  
  `© 2025 휠도시 · Map API 제공: KakaoMap`

---

## 🗂️ 디렉토리 구조
```

test_server/
├─ server.js          # Node.js + Express 정적 서버
├─ package.json       # Node.js 의존성 관리
└─ public/            # 정적 웹 리소스
├─ index.html     # 메인 페이지 (지도)
├─ about.html
├─ report.html
├─ map.html
├─ help.html
└─ login.html

````

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

## 📄 라이선스

* 지도 및 장소 데이터: **Kakao Map API**







