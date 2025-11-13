# 카카오맵 영업시간 크롤러 (단독 실행)

> **참고**: 검색 기능에 통합된 자동 크롤링을 사용하려면 `SETUP_CRAWLING.md`를 참조하세요.  
> 이 문서는 크롤러를 **단독으로 실행**하여 데이터를 수집할 때 사용합니다.

## 설치 방법

```bash
npm install puppeteer
```

## 사용 방법

### 1. 기본 실행
```bash
node crawl_business_hours.js
```

### 2. 크롤링할 장소 수정
`crawl_business_hours.js` 파일의 `placeNames` 배열을 수정하세요:

```javascript
const placeNames = [
    '장소명1',
    '장소명2',
    '장소명3'
];
```

## 출력 결과

크롤링 결과는 `business_hours_data.json` 파일에 저장됩니다.

```json
[
  {
    "placeName": "엔제리너스 대전카이스트점",
    "businessHours": {
      "summary": "영업 중 · 22:00에 영업 종료",
      "details": {
        "월요일": "08:00 ~ 22:00",
        "화요일": "08:00 ~ 22:00",
        "수요일": "08:00 ~ 22:00",
        "목요일": "08:00 ~ 22:00",
        "금요일": "08:00 ~ 22:00",
        "토요일": "10:00 ~ 20:00",
        "일요일": "10:00 ~ 20:00"
      },
      "timestamp": "2025-11-13T..."
    },
    "phoneNumber": "042-350-0856",
    "address": "대전 유성구 구성동 23",
    "crawledAt": "2025-11-13T..."
  }
]
```

## 주의사항

⚠️ **중요**: 이 스크립트는 테스트/학습 목적으로만 사용하세요.

1. **법적 주의사항**
   - 카카오맵 이용약관을 반드시 확인하세요
   - 과도한 크롤링은 서비스 차단을 초래할 수 있습니다
   - 상업적 목적으로 사용 금지

2. **기술적 제한사항**
   - 카카오맵 HTML 구조가 변경되면 동작하지 않을 수 있습니다
   - 크롤링 속도를 제한하여 서버 부하를 줄이세요
   - headless: false로 설정하여 디버깅 가능

3. **대안**
   - 가능하다면 공식 API 사용을 권장합니다
   - Kakao Local API: https://developers.kakao.com/docs/latest/ko/local/dev-guide

## 선택자 업데이트

카카오맵 구조가 변경되면 다음 선택자들을 업데이트해야 합니다:

```javascript
// 검색창
'#search\\.keyword\\.query'

// 검색 결과 리스트
'#info\\.search\\.place\\.list > li:first-child a'

// 영업시간
'.location_detail .txt_operation'

// 전화번호
'.location_detail .txt_phone'

// 주소
'.location_detail .txt_address'
```

## 파일 삭제

사용 후 크롤러가 필요없다면:

```bash
# Windows
del crawl_business_hours.js
del README_CRAWLER.md
del business_hours_data.json

# Mac/Linux
rm crawl_business_hours.js
rm README_CRAWLER.md
rm business_hours_data.json
```

## 문제 해결

### Puppeteer 설치 실패
```bash
# 재설치
npm uninstall puppeteer
npm install puppeteer --force
```

### 크롤링 실패
1. headless: false로 설정하여 브라우저 확인
2. 대기 시간(waitForTimeout) 늘리기
3. 선택자가 올바른지 개발자 도구로 확인

### 차단당했을 때
1. 크롤링 간격을 더 늘리기 (5초 이상)
2. User-Agent 설정 추가
3. 프록시 사용 고려

